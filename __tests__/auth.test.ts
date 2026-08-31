/**
 * Requires (devDependencies not yet in package.json - see README note):
 *   npm install --save-dev axios-mock-adapter
 *
 * Mocks expo-secure-store with an in-memory Map so saveTokens/getAccessToken
 * /getRefreshToken/clearTokens can be exercised without real Keychain/
 * Keystore access (unavailable in the Jest/node environment).
 *
 * Two separate MockAdapter instances are used because auth.ts's
 * refreshAccessToken() deliberately calls plain `axios.post(...)` (not the
 * `api` instance) to avoid recursing through api's own interceptor - see
 * the comment in lib/auth.ts.
 */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../lib/api';
import { getAccessToken, getRefreshToken, saveTokens } from '../lib/auth';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

describe('auth flow', () => {
  let apiMock: MockAdapter;
  let axiosMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(api);
    axiosMock = new MockAdapter(axios);
  });

  afterEach(async () => {
    apiMock.restore();
    axiosMock.restore();
    // Reset on-device state between tests.
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync('auth_access_token');
    await SecureStore.deleteItemAsync('auth_refresh_token');
    jest.clearAllMocks();
  });

  it('register -> verify-otp happy path stores tokens', async () => {
    apiMock.onPost('/auth/register').reply(200, {
      message: 'Registration successful. Please verify your phone number with the code we sent.',
    });
    apiMock.onPost('/auth/verify-otp').reply(200, {
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      token_type: 'bearer',
    });

    await api.post('/auth/register', {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '+919876543210',
      password: 'password1',
    });

    const verifyResponse = await api.post<{ access_token: string; refresh_token: string }>(
      '/auth/verify-otp',
      { phone_number: '+919876543210', code: '123456' }
    );

    await saveTokens(verifyResponse.data.access_token, verifyResponse.data.refresh_token);

    await expect(getAccessToken()).resolves.toBe('access-123');
    await expect(getRefreshToken()).resolves.toBe('refresh-456');
  });

  it('wrong OTP surfaces the backend error message', async () => {
    // Backend returns the same generic message for "unknown phone" and
    // "wrong code" - see verify_otp() in routers/auth.py.
    apiMock.onPost('/auth/verify-otp').reply(400, { detail: 'Invalid or expired code' });

    await expect(
      api.post('/auth/verify-otp', { phone_number: '+919876543210', code: '000000' })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { detail: 'Invalid or expired code' },
      },
    });
  });

  it('a 401 on a protected call triggers exactly one refresh attempt before retrying', async () => {
    await saveTokens('expired-access', 'valid-refresh');

    let protectedCallCount = 0;
    apiMock.onGet('/bookings/me').reply((config) => {
      protectedCallCount += 1;
      const authHeader = (config.headers as Record<string, string> | undefined)?.Authorization;
      if (authHeader === 'Bearer expired-access') {
        return [401, { detail: 'Invalid or expired authentication token' }];
      }
      return [200, { ok: true }];
    });

    let refreshCallCount = 0;
    axiosMock.onPost(/\/auth\/refresh$/).reply(() => {
      refreshCallCount += 1;
      return [200, { access_token: 'fresh-access', token_type: 'bearer' }];
    });

    const response = await api.get('/bookings/me');

    expect(response.status).toBe(200);
    expect(refreshCallCount).toBe(1);
    expect(protectedCallCount).toBe(2); // first call (401) + retry (200)
    await expect(getAccessToken()).resolves.toBe('fresh-access');
  });

  it('clears tokens and rejects when the refresh token itself is invalid', async () => {
    await saveTokens('expired-access', 'expired-refresh');

    apiMock.onGet('/bookings/me').reply(401, { detail: 'Invalid or expired authentication token' });
    axiosMock
      .onPost(/\/auth\/refresh$/)
      .reply(401, { detail: 'Invalid or expired refresh token' });

    await expect(api.get('/bookings/me')).rejects.toBeTruthy();

    await expect(getAccessToken()).resolves.toBeNull();
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it('does not attach an Authorization header to /auth/* calls', async () => {
    await saveTokens('some-access', 'some-refresh');

    apiMock.onPost('/auth/login').reply((config) => {
      expect((config.headers as Record<string, string> | undefined)?.Authorization).toBeUndefined();
      return [200, { access_token: 'a', refresh_token: 'r', token_type: 'bearer' }];
    });

    await api.post('/auth/login', { email: 'jane@example.com', password: 'password1' });
  });
});
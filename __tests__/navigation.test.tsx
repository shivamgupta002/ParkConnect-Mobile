import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { fireEvent } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { describe } from 'zod/v4/core';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));

const mockedGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockedJwtDecode = jwtDecode as jest.Mock;

const context = require.context('../app');

describe('navigation shell', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the login screen when there is no stored token', async () => {
    mockedGetItemAsync.mockResolvedValue(null);

    renderRouter(context, { initialUrl: '/' });

    await waitFor(() => expect(screen).toHavePathname('/login'));
  });

  it('lands a non-admin token on the owner tabs', async () => {
    mockedGetItemAsync.mockResolvedValue('fake.token');
    mockedJwtDecode.mockReturnValue({ sub: 'user_1', is_admin: false, exp: Date.now() / 1000 + 3600 });

    renderRouter(context, { initialUrl: '/' });

    await waitFor(() => expect(screen).toHavePathname('/vehicles'));
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Subscription')).toBeTruthy();
  });

  it('lands an admin token on the admin drawer', async () => {
    mockedGetItemAsync.mockResolvedValue('fake.token');
    mockedJwtDecode.mockReturnValue({ sub: 'admin_1', is_admin: true, exp: Date.now() / 1000 + 3600 });

    renderRouter(context, { initialUrl: '/' });

    await waitFor(() => expect(screen.getByText('Overview')).toBeTruthy());
  });

  it('logs out and returns to the login screen', async () => {
    mockedGetItemAsync.mockResolvedValue('fake.token');
    mockedJwtDecode.mockReturnValue({ sub: 'user_1', is_admin: false, exp: Date.now() / 1000 + 3600 });

    renderRouter(context, { initialUrl: '/' });
    await waitFor(() => expect(screen).toHavePathname('/vehicles'));

    fireEvent.press(screen.getByText('Log out'));

    await waitFor(() => expect(screen).toHavePathname('/login'));
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
  });
});
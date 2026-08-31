/**
 * On-device auth token storage + refresh, backed by expo-secure-store
 * (Keychain on iOS, Keystore on Android).
 *
 * This is the RN-native equivalent of the httpOnly cookies the web app used:
 * not readable by JS in a webview, not plaintext on disk.
 *
 * IMPORTANT: refreshAccessToken() intentionally uses a plain axios call
 * (not the `api` instance from ./api) so it never goes through api's own
 * response interceptor — that interceptor calls refreshAccessToken() on a
 * 401, and reusing `api` here would risk an infinite loop.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from './config';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function saveTokens(access: string, refresh: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Exchanges the stored refresh token for a new access token via
 * POST /auth/refresh ({ refresh_token }) -> { access_token, token_type }.
 *
 * Note: the backend only rotates the access token on refresh, not the
 * refresh token itself (see AccessTokenResponse in auth.py) — so we only
 * ever overwrite the access token here.
 *
 * Throws (after clearing both tokens) if there's no refresh token on device
 * or the backend rejects it as expired/invalid, so the caller can redirect
 * to login.
 */
export async function refreshAccessToken(): Promise<string> {
  const refresh_token = await getRefreshToken();

  if (!refresh_token) {
    await clearTokens();
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<{ access_token: string; token_type: string }>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token }
    );

    const { access_token } = response.data;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
    return access_token;
  } catch (err) {
    // Refresh token itself is expired/invalid (backend returns 401) - clear
    // everything on-device so the caller can redirect to login.
    await clearTokens();
    throw err;
  }
}
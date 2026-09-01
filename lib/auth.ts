import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AccessTokenPayload {
  sub: string;
  is_admin?: boolean; // added backend Phase 2/13; absent on pre-Phase-13 tokens
  exp: number;
  [key: string]: unknown;
}

export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'owner' }
  | { status: 'admin' };

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// --- platform-aware storage ---------------------------------------------

async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// --- public API -----------------------------------------------------------

export async function getAccessToken(): Promise<string | null> {
  return getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteItemAsync(ACCESS_TOKEN_KEY),
    deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Fallback for tokens that predate the is_admin claim (or any malformed
 * token). This is purely for deciding which stack to *render* — never
 * treated as an authorization decision, since the backend re-validates
 * every request regardless.
 */
async function fetchIsAdminFromProfile(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const profile = await res.json();
    return Boolean(profile?.is_admin);
  } catch {
    return false; // fail closed to the owner experience
  }
}

export async function resolveAuthState(): Promise<AuthState> {
  const token = await getAccessToken();
  if (!token) return { status: 'unauthenticated' };

  try {
    const payload = jwtDecode<AccessTokenPayload>(token);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      await clearTokens();
      return { status: 'unauthenticated' };
    }

    if (typeof payload.is_admin === 'boolean') {
      return { status: payload.is_admin ? 'admin' : 'owner' };
    }

    const isAdmin = await fetchIsAdminFromProfile(token);
    return { status: isAdmin ? 'admin' : 'owner' };
  } catch {
    await clearTokens();
    return { status: 'unauthenticated' };
  }
}
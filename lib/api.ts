/**
 * Shared axios instance for all backend calls.
 *
 * - Request interceptor attaches `Authorization: Bearer <access_token>` to
 *   every request EXCEPT the /auth/* endpoints themselves (register/login/
 *   verify-otp/refresh/forgot-password/reset-password don't need it, and
 *   attaching a possibly-expired token to /auth/refresh would be pointless).
 * - Response interceptor: on a 401 from a non-auth endpoint, attempts
 *   refreshAccessToken() exactly once and retries the original request. If
 *   the refresh also fails, tokens are already cleared (inside
 *   refreshAccessToken) and we just reject - navigation to login is the
 *   root layout's job (Phase R2), not this file's.
 *
 * NOTE: If mobile/lib/api.ts already exists from R0 with its own baseURL
 * config, merge that in here instead of the Constants fallback below -
 * this task adds no new env vars, so API_BASE_URL should come from
 * whatever R0 already wired up (app.json `extra`, expo-constants, etc).
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from './config';
import { clearTokens, getAccessToken, refreshAccessToken } from './auth';

export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const AUTH_PREFIX = '/auth/';

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  // Handles both relative ('/auth/login') and absolute
  // (`${API_BASE_URL}/auth/login`) forms just in case.
  return url.includes(AUTH_PREFIX);
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!isAuthEndpoint(config.url)) {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers ?? ({} as InternalAxiosRequestConfig['headers']);
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Coalesces concurrent 401s (e.g. several requests in flight at once) into
// a single in-flight refresh call instead of firing one refresh per request.
let refreshPromise: Promise<string> | null = null;

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    const shouldAttemptRefresh =
      status === 401 &&
      originalRequest !== undefined &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url);

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers ?? ({} as RetryableConfig['headers']);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      // refreshAccessToken() already cleared tokens on failure. Reject and
      // let the caller (a screen / root layout auth check) react - no
      // navigation is performed from inside this interceptor.
      await clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
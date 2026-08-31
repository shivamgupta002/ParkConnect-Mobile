/**
 * Shared config, pulled out of api.ts so that api.ts and auth.ts can both
 * depend on it without depending on each other (avoids the require cycle
 * you'd get from api.ts importing getAccessToken/refreshAccessToken from
 * auth.ts, while auth.ts imports API_BASE_URL from api.ts).
 */
import Constants from 'expo-constants';

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://127.0.0.1:8000';
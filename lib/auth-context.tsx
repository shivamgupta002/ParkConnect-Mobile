import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAccessToken, saveTokens, clearTokens } from '@/lib/auth';
import { api } from '@/lib/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Confirms the token (or its refresh, via the api.ts interceptor)
        // is actually valid — not just present in storage.
        await api.get('/auth/me');
        setIsAuthenticated(true);
      } catch {
        // Both access + refresh tokens are invalid at this point;
        // api.ts's interceptor already cleared them on refresh failure.
        await clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
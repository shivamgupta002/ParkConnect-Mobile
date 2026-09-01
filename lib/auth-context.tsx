import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AuthState, clearTokens, resolveAuthState } from './auth';

interface AuthContextValue {
  authState: AuthState | null; // null while the initial check is in flight
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState | null>(null);

  const refresh = useCallback(async () => {
    setAuthState(await resolveAuthState());
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setAuthState({ status: 'unauthenticated' });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ authState, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
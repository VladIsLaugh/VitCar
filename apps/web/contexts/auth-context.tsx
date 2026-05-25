'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiClient, setApiToken, setRefreshCallback } from '@/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((token: string, userData: AuthUser) => {
    setApiToken(token);
    setAccessToken(token);
    setUser(userData);
    window.dispatchEvent(new CustomEvent('vitauto:login'));
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore — cookie is cleared server-side regardless
    }
    setApiToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    try {
      const res = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      const { accessToken: newToken } = res.data;
      setApiToken(newToken);
      setAccessToken(newToken);
      // Fetch user profile with the new token in place
      const meRes = await apiClient.get<AuthUser>('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(meRes.data);
      return newToken;
    } catch {
      setApiToken(null);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Register the refresh callback for the axios interceptor
  useEffect(() => {
    setRefreshCallback(refreshTokens);
    return () => setRefreshCallback(null);
  }, [refreshTokens]);

  // Restore session on mount
  useEffect(() => {
    refreshTokens().finally(() => setIsLoading(false));
  }, [refreshTokens]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

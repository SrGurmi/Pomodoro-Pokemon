import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setTokens, clearTokens, apiPost, apiGet } from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await apiPost<{ accessToken: string }>('/api/auth/refresh', { refreshToken });
        setTokens(data.accessToken, refreshToken);
        const me = await apiGet<{ user: User }>('/api/auth/me');
        setUser(me.user);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ user: User; accessToken: string; refreshToken: string }>(
      '/api/auth/login',
      { email, password }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await apiPost<{ user: User; accessToken: string; refreshToken: string }>(
      '/api/auth/register',
      { email, username, password }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await apiPost('/api/auth/logout', { refreshToken });
    } catch {
      // continue even if logout request fails
    }
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

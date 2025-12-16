'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getToken, getStoredUser, setToken, setUser, logout as authLogout, getMe } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const freshUser = await getMe(storedToken);
          setTokenState(storedToken);
          setUserState(freshUser);
        } catch (error) {
          // Token invalid, clear storage
          authLogout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    authLogout();
    setTokenState(null);
    setUserState(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const freshUser = await getMe(token);
        setUser(freshUser);
        setUserState(freshUser);
      } catch (error) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

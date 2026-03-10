import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import {
  clearSessionFromStorage,
  loadSessionFromStorage,
  loginWithEmailPassword,
  persistSessionToStorage,
  registerUser,
} from '../services/auth';
import { getApiErrorMessage, getApiErrorMessageByStatus, setAccessToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const session = await loadSessionFromStorage();
      if (session) {
        setToken(session.token);
        setUser(session.user);
        setAccessToken(session.token);
      }
    } catch (error) {
      console.error('Load auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const session = await loginWithEmailPassword(email, password);
      setToken(session.token);
      setUser(session.user);
      setAccessToken(session.token);
      await persistSessionToStorage(session, rememberMe);
    } catch (error: any) {
      // Generic failure message (do not leak whether email exists)
      throw new Error(
        getApiErrorMessageByStatus(
          error,
          {
            400: 'Invalid email or password',
            401: 'Invalid email or password',
          },
          'Unable to sign in. Please try again.'
        )
      );
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await registerUser(fullName, email, password);
      const payload = response?.data;
      if (!payload) throw new Error('Registration failed');
      return payload;
    } catch (error: any) {
      throw new Error(getApiErrorMessage(error, 'Unable to register. Please try again.'));
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAccessToken(null);
    await clearSessionFromStorage();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { User } from '../types';

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
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Load auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Check if response.data exists and has the expected properties
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error(response.data?.message || 'Login response data is invalid');
      }
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      if (rememberMe) {
        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (error: any) {
      // Handle login error by throwing a more descriptive error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Unable to reach server');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unknown error occurred');
      }
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ fullName, email, password });
      
      // Check if response.data exists
      if (!response.data) {
        throw new Error(response.data?.message || 'Registration response data is null');
      }
      
      return response.data;
    } catch (error: any) {
      // Handle registration error by throwing a more descriptive error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Registration failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: Unable to reach server');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unknown error occurred');
      }
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
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
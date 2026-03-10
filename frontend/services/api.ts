import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

let inMemoryToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
});

export const setAccessToken = (token: string | null) => {
  inMemoryToken = token;

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use(async (config) => {
  try {
    const storedToken = await AsyncStorage.getItem('token');
    const token = inMemoryToken ?? storedToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url, token ? 'with token' : 'without token');
  } catch (error) {
    console.error('Error getting token from storage:', error);
  }

  return config;
});

const safeResponse = (response: any) => {
  if (response && response.data !== undefined && response.data !== null) {
    return response.data;
  }
  return null;
};

export const getApiErrorMessage = (error: any, fallbackMessage = 'Something went wrong') => {
  const message = error?.response?.data?.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }
  return fallbackMessage;
};

export const getApiErrorMessageByStatus = (
  error: any,
  statusFallbackMap: Record<number, string>,
  defaultFallback = 'Something went wrong'
) => {
  const status = error?.response?.status;
  const fallback = typeof status === 'number' ? (statusFallbackMap[status] ?? defaultFallback) : defaultFallback;
  return getApiErrorMessage(error, fallback);
};

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing stored token');
      setAccessToken(null);
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return { ...response, data: safeResponse(response) };
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    return { ...response, data: safeResponse(response) };
  },
};

export const productAPI = {
  getAll: async (search?: string, sortBy?: string) => {
    const response = await api.get('/products', { params: { search, sortBy } });
    return { ...response, data: safeResponse(response) };
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return { ...response, data: safeResponse(response) };
  },
  create: async (data: any) => {
    const response = await api.post('/products', data);
    return { ...response, data: safeResponse(response) };
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return { ...response, data: safeResponse(response) };
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return { ...response, data: safeResponse(response) };
  },
};

export const orderAPI = {
  create: async (data: any) => {
    const response = await api.post('/orders', data);
    return { ...response, data: safeResponse(response) };
  },
  getMyOrders: async () => {
    const response = await api.get('/orders/my');
    return { ...response, data: safeResponse(response) };
  },
  getRevenue: async (period?: string, date?: string) => {
    const response = await api.get('/orders/revenue', { params: { period, date } });
    return { ...response, data: safeResponse(response) };
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return { ...response, data: safeResponse(response) };
  },
};

export default api;

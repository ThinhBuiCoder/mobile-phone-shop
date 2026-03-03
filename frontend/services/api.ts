import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Tự động chọn URL dựa vào platform
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api'; // Web
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api'; // Android emulator
  } else {
    return 'http://localhost:5000/api'; // iOS simulator
  }
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, token ? 'with token' : 'without token');
  } catch (error) {
    console.error('Error getting token from storage:', error);
  }
  return config;
});

// Helper function to safely extract data from API responses
const safeResponse = (response: any) => {
  if (response && response.data !== undefined && response.data !== null) {
    return response.data;
  }
  return null;
};

// Response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    // Ensure response always has data property
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    // Log the error for debugging purposes
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing stored token');
      // Clear stored token on 401
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    
    // Return a rejected promise with error info
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
  getRevenue: async (period?: string, date?: string) => {
    const response = await api.get('/orders/revenue', { params: { period, date } });
    return { ...response, data: safeResponse(response) };
  },
};



export default api;
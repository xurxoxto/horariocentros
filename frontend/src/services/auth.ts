import axios from 'axios';
import { User, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      { email, password }
    );
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('authToken', response.data.data.token);
      return response.data.data.user;
    }
    
    throw new Error(response.data.error || 'Login failed');
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  async loginWithSSO(provider: 'google' | 'microsoft'): Promise<User> {
    // Redirect to SSO provider
    window.location.href = `${API_URL}/auth/sso/${provider}`;
    // This will redirect, so we'll never reach here in normal flow
    // The callback will handle setting the token
    return {} as User;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async register(
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      { email, password, name, role }
    );
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('authToken', response.data.data.token);
      return response.data.data.user;
    }
    
    throw new Error(response.data.error || 'Registration failed');
  },
};

export default api;

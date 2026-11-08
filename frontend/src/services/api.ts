import axios, { AxiosInstance } from 'axios';
import { AuthResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data on 401
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/signup', {
      email,
      name,
      password,
    });
    return response.data;
  }

  async loginOwner(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login/owner', {
      email,
      password,
    });
    return response.data;
  }

  async loginCollector(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login/collector', {
      username,
      password,
    });
    return response.data;
  }

  async login(email?: string, username?: string, password?: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      username,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }
}

export const apiClient = new ApiClient();

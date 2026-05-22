import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config';
import { AuthResponse, User } from '@types';

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.auth.login, { email, password });
  },

  register: (name: string, email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.auth.register, { name, email, password });
  },

  logout: (): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.auth.logout);
  },

  getMe: (): Promise<{ user: User }> => {
    return apiClient.get(API_ENDPOINTS.auth.me);
  },
};

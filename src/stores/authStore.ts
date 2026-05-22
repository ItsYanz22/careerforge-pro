import { create } from 'zustand';
import { User, UserFeatures } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  fetchMe: () => Promise<void>;
  updateFeatures: (features: UserFeatures) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      
      const { token, user } = response;
      localStorage.setItem('token', token);
      if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(name, email, password);
      
      const { token, user } = response;
      localStorage.setItem('token', token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout().catch(() => {}); // ignore error on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  fetchMe: async () => {
    try {
      const response = await authApi.getMe();
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      // Token might be invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  clearError: () => set({ error: null }),
  updateFeatures: (features) =>
    set((state) => ({
      user: state.user ? { ...state.user, features } : null,
    })),
}));

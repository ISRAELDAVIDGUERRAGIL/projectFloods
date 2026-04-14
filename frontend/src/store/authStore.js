// Store Zustand
// src/store/authStore.js

import create from 'zustand';
import { authApi } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Login failed', 
        loading: false 
      });
      return false;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await authApi.register(data);
      set({ loading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Registration failed', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
}));

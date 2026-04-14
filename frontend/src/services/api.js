// Servicio API
// src/services/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const deviceApi = {
  list: () => api.get('/devices'),
  create: (data) => api.post('/devices', data),
  get: (deviceId) => api.get(`/devices/${deviceId}`),
  update: (deviceId, data) => api.put(`/devices/${deviceId}`, data),
  delete: (deviceId) => api.delete(`/devices/${deviceId}`),
};

export const measurementApi = {
  getLatest: (deviceId) => api.get('/measurements/latest', { params: { deviceId } }),
  getHistory: (deviceId, options = {}) => api.get('/measurements', {
    params: { deviceId, ...options }
  }),
};

export const alertApi = {
  getActive: () => api.get('/alerts'),
  getHistory: (deviceId, options = {}) => api.get('/alerts/history', {
    params: { deviceId, ...options }
  }),
  triggerAlarm: (deviceId) => api.post('/alerts/trigger-alarm', { deviceId }),
};

export const configApi = {
  get: (deviceId) => api.get('/config', { params: { deviceId } }),
  update: (deviceId, config) => api.put('/config', { deviceId, ...config }),
};

export const analyticsApi = {
  getStats: (deviceId, period = '30d') => api.get('/analytics/stats', {
    params: { deviceId, period }
  }),
};

export default api;

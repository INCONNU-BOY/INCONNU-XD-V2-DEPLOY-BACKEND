import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const register = (userData) => api.post('/auth/register', userData);
export const login = (email, password) => api.post('/auth/login', { email, password });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.put(`/auth/reset-password/${token}`, { password });
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const resendVerificationEmail = (email) => api.post('/auth/resend-verification', { email });
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getReferrals = () => api.get('/auth/referrals');
export const getReferralStats = () => api.get('/auth/referral-stats');

// Server Services
export const createServer = (serverData) => api.post('/servers/create', serverData);
export const getUserServers = () => api.get('/servers');
export const getServer = (serverId) => api.get(`/servers/${serverId}`);
export const updateServer = (serverId, data) => api.put(`/servers/${serverId}`, data);
export const deleteServer = (serverId) => api.delete(`/servers/${serverId}`);
export const startServer = (serverId) => api.post(`/servers/${serverId}/start`);
export const stopServer = (serverId) => api.post(`/servers/${serverId}/stop`);
export const restartServer = (serverId) => api.post(`/servers/${serverId}/restart`);
export const getServerStatus = (serverId) => api.get(`/servers/${serverId}/status`);
export const getServerLogs = (serverId, limit = 100) => api.get(`/servers/${serverId}/logs`, { params: { limit } });

// Session Services
export const generateSession = () => api.get('/servers/session/generate');
export const validateSession = (sessionId) => api.post('/servers/session/validate', { sessionId });
export const validateReferralCode = (code) => api.post('/auth/validate-referral', { code });

// Coins Services
export const checkCoins = () => api.get('/coins/check');
export const getTransactionHistory = (page = 1, limit = 20) => api.get('/coins/transactions', { params: { page, limit } });

// System Services
export const getSystemStats = () => api.get('/system/stats');
export const getSystemLogs = (logFile = 'combined', lines = 100) => api.get('/system/logs', { params: { logFile, lines } });

// Admin Services
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (page = 1, limit = 20, search = '') => api.get('/admin/users', { params: { page, limit, search } });
export const getAdminUser = (userId) => api.get(`/admin/users/${userId}`);
export const updateAdminUser = (userId, data) => api.put(`/admin/users/${userId}`, data);
export const deleteAdminUser = (userId) => api.delete(`/admin/users/${userId}`);
export const addAdminCoins = (data) => api.post('/admin/coins/add', data);
export const removeAdminCoins = (data) => api.post('/admin/coins/remove', data);
export const getAdminServers = (page = 1, limit = 20, status = '') => api.get('/admin/servers', { params: { page, limit, status } });
export const adminServerAction = (serverId, data) => api.post(`/admin/servers/${serverId}/action`, data);
export const getAdminLogs = (logFile = 'combined', lines = 100) => api.get('/admin/logs', { params: { logFile, lines } });
export const cleanupSystem = () => api.post('/admin/maintenance/cleanup');
export const restartSystem = () => api.post('/admin/maintenance/restart');

export default api;

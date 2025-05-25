import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api/auth' 
  : 'http://localhost:3001/api/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/logout');
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/profile', userData);
    return response;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/password', {
      currentPassword,
      newPassword,
    });
    return response;
  },
}; 
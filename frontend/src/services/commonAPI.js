import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== COMMON OPERATIONS FOR ALL ROLES =====

// 1. AUTHENTICATION (All users can login/logout/register)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// 2. HEALTH CHECK (System health monitoring)
export const healthAPI = {
  check: () => api.get('/health'),
};

// 3. BASIC READING OPERATIONS (Read-only access for all users)
export const commonReadAPI = {
  // Basic subject information (all can view)
  getAllSubjects: () => api.get('/subjects'),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  
  // Basic class information (all can view)
  getAllClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  
  // Basic user information (for dropdowns, etc.)
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
};

export default {
  auth: authAPI,
  health: healthAPI,
  read: commonReadAPI,
}; 
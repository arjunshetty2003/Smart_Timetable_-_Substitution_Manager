import axios from 'axios';

// In development, use relative path for API requests to leverage Nginx proxy
// In production, use environment variable or fallback to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear local auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  verifyToken: () => apiClient.get('/auth/verify'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

export const usersAPI = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (userData) => apiClient.put('/users/me', userData),
  changePassword: (passwordData) => apiClient.post('/users/change-password', passwordData),
  getAll: () => apiClient.get('/users'),
};

export const timetablesAPI = {
  getAll: () => apiClient.get('/timetables'),
  getById: (id) => apiClient.get(`/timetables/${id}`),
  create: (timetableData) => apiClient.post('/timetables', timetableData),
  update: (id, timetableData) => apiClient.put(`/timetables/${id}`, timetableData),
  delete: (id) => apiClient.delete(`/timetables/${id}`),
};

export const schedulesAPI = {
  getAll: () => apiClient.get('/schedules'),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  create: (scheduleData) => apiClient.post('/schedules', scheduleData),
  update: (id, scheduleData) => apiClient.put(`/schedules/${id}`, scheduleData),
  delete: (id) => apiClient.delete(`/schedules/${id}`),
};

export const subjectsAPI = {
  getAll: () => apiClient.get('/subjects'),
  getById: (id) => apiClient.get(`/subjects/${id}`),
  create: (subjectData) => apiClient.post('/subjects', subjectData),
  update: (id, subjectData) => apiClient.put(`/subjects/${id}`, subjectData),
  delete: (id) => apiClient.delete(`/subjects/${id}`),
};

export const classesAPI = {
  getAll: () => apiClient.get('/classes'),
  getById: (id) => apiClient.get(`/classes/${id}`),
  create: (classData) => apiClient.post('/classes', classData),
  update: (id, classData) => apiClient.put(`/classes/${id}`, classData),
  delete: (id) => apiClient.delete(`/classes/${id}`),
};

export const substitutionsAPI = {
  getAll: () => apiClient.get('/substitutions'),
  getById: (id) => apiClient.get(`/substitutions/${id}`),
  create: (substitutionData) => apiClient.post('/substitutions', substitutionData),
  update: (id, substitutionData) => apiClient.put(`/substitutions/${id}`, substitutionData),
};

export const specialClassesAPI = {
  getAll: () => apiClient.get('/special-classes'),
  getById: (id) => apiClient.get(`/special-classes/${id}`),
  create: (specialClassData) => apiClient.post('/special-classes', specialClassData),
  update: (id, specialClassData) => apiClient.put(`/special-classes/${id}`, specialClassData),
  delete: (id) => apiClient.delete(`/special-classes/${id}`),
};

export default apiClient;
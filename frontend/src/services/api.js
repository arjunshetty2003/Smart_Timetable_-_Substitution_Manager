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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getAvailableFaculty: (params) => api.get('/users/faculty/available', { params }),
};

// Subjects API
export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (subjectData) => api.post('/subjects', subjectData),
  update: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Classes API
export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (classData) => api.post('/classes', classData),
  update: (id, classData) => api.put(`/classes/${id}`, classData),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Substitutions API
export const substitutionsAPI = {
  getAll: (params) => api.get('/substitutions', { params }),
  getById: (id) => api.get(`/substitutions/${id}`),
  create: (substitutionData) => api.post('/substitutions', substitutionData),
  update: (id, substitutionData) => api.put(`/substitutions/${id}`, substitutionData),
  delete: (id) => api.delete(`/substitutions/${id}`),
  approve: (id) => api.put(`/substitutions/${id}/approve`),
  reject: (id) => api.put(`/substitutions/${id}/reject`),
};

// Timetables API
export const timetablesAPI = {
  getAll: (params) => api.get('/timetables', { params }),
  getById: (id) => api.get(`/timetables/${id}`),
  create: (timetableData) => api.post('/timetables', timetableData),
  update: (id, timetableData) => api.put(`/timetables/${id}`, timetableData),
  delete: (id) => api.delete(`/timetables/${id}`),
  generate: (data) => api.post('/timetables/generate', data),
};

// Schedules API
export const schedulesAPI = {
  getAll: (params) => api.get('/schedules', { params }),
  getDashboard: () => api.get('/schedules/dashboard'),
  getFacultyDashboard: () => api.get('/schedules/faculty/dashboard'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (scheduleData) => api.post('/schedules', scheduleData),
  update: (id, scheduleData) => api.put(`/schedules/${id}`, scheduleData),
  delete: (id) => api.delete(`/schedules/${id}`),
  requestSubstitution: (id, data) => api.post(`/schedules/${id}/substitute`, data),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 
import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  // If VITE_API_URL is defined, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development fallback
  return 'http://localhost:5001';
};

// Create API client
const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token to headers if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service exports
export default apiClient;

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
  getMe: () => apiClient.get('/api/auth/me'),
  logout: () => apiClient.get('/api/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: () => apiClient.get('/api/users'),
  getById: (id) => apiClient.get(`/api/users/${id}`),
  create: (userData) => apiClient.post('/api/users', userData),
  update: (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  delete: (id) => apiClient.delete(`/api/users/${id}`),
};

// Timetables API
export const timetablesAPI = {
  getAll: (params) => apiClient.get('/api/timetables', { params }),
  getById: (id) => apiClient.get(`/api/timetables/${id}`),
  create: (timetableData) => apiClient.post('/api/timetables', timetableData),
  update: (id, timetableData) => apiClient.put(`/api/timetables/${id}`, timetableData),
  delete: (id) => apiClient.delete(`/api/timetables/${id}`),
};

// Schedules API
export const schedulesAPI = {
  getAll: (params) => apiClient.get('/api/schedules', { params }),
  getById: (id) => apiClient.get(`/api/schedules/${id}`),
  create: (scheduleData) => apiClient.post('/api/schedules', scheduleData),
  update: (id, scheduleData) => apiClient.put(`/api/schedules/${id}`, scheduleData),
  delete: (id) => apiClient.delete(`/api/schedules/${id}`),
  getDashboardStats: () => apiClient.get('/api/schedules/dashboard'),
  getFacultyDashboard: () => apiClient.get('/api/schedules/faculty/dashboard'),
  getStudentDashboard: () => apiClient.get('/api/schedules/student/dashboard'),
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
import axios from 'axios';

// Use environment variable if available, otherwise default to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear local auth data
      localStorage.removeItem('authToken');
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
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    verifyToken: () => apiClient.get('/auth/verify'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  },
  
  // User endpoints
  users: {
    getProfile: () => apiClient.get('/users/me'),
    updateProfile: (userData) => apiClient.put('/users/me', userData),
    changePassword: (passwordData) => apiClient.post('/users/change-password', passwordData),
  },
  
  // Timetable endpoints
  timetables: {
    getAll: () => apiClient.get('/timetables'),
    getById: (id) => apiClient.get(`/timetables/${id}`),
    create: (timetableData) => apiClient.post('/timetables', timetableData),
    update: (id, timetableData) => apiClient.put(`/timetables/${id}`, timetableData),
    delete: (id) => apiClient.delete(`/timetables/${id}`),
  },
  
  // Schedule endpoints
  schedules: {
    getAll: () => apiClient.get('/schedules'),
    getById: (id) => apiClient.get(`/schedules/${id}`),
    create: (scheduleData) => apiClient.post('/schedules', scheduleData),
    update: (id, scheduleData) => apiClient.put(`/schedules/${id}`, scheduleData),
    delete: (id) => apiClient.delete(`/schedules/${id}`),
  },
  
  // Subject endpoints
  subjects: {
    getAll: () => apiClient.get('/subjects'),
    getById: (id) => apiClient.get(`/subjects/${id}`),
    create: (subjectData) => apiClient.post('/subjects', subjectData),
    update: (id, subjectData) => apiClient.put(`/subjects/${id}`, subjectData),
    delete: (id) => apiClient.delete(`/subjects/${id}`),
  },
  
  // Class endpoints
  classes: {
    getAll: () => apiClient.get('/classes'),
    getById: (id) => apiClient.get(`/classes/${id}`),
    create: (classData) => apiClient.post('/classes', classData),
    update: (id, classData) => apiClient.put(`/classes/${id}`, classData),
    delete: (id) => apiClient.delete(`/classes/${id}`),
  },
  
  // Substitution endpoints
  substitutions: {
    getAll: () => apiClient.get('/substitutions'),
    getById: (id) => apiClient.get(`/substitutions/${id}`),
    create: (substitutionData) => apiClient.post('/substitutions', substitutionData),
    update: (id, substitutionData) => apiClient.put(`/substitutions/${id}`, substitutionData),
    delete: (id) => apiClient.delete(`/substitutions/${id}`),
  },
  
  // Special classes endpoints
  specialClasses: {
    getAll: () => apiClient.get('/special-classes'),
    getById: (id) => apiClient.get(`/special-classes/${id}`),
    create: (specialClassData) => apiClient.post('/special-classes', specialClassData),
    update: (id, specialClassData) => apiClient.put(`/special-classes/${id}`, specialClassData),
    delete: (id) => apiClient.delete(`/special-classes/${id}`),
  },
  
  // Notifications endpoints
  notifications: {
    getAll: () => apiClient.get('/notifications'),
    getById: (id) => apiClient.get(`/notifications/${id}`),
    markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/notifications/read-all'),
  },
};

// Export for direct import of the service
export default apiService;

// Export individual APIs for backward compatibility
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  changePassword: (passwordData) => apiClient.put('/auth/change-password', passwordData),
  logout: () => apiClient.post('/auth/logout'),
};

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (userData) => apiClient.post('/users', userData),
  update: (id, userData) => apiClient.put(`/users/${id}`, userData),
  delete: (id) => apiClient.delete(`/users/${id}`),
  getAvailableFaculty: (params) => apiClient.get('/users/faculty/available', { params }),
};

export const subjectsAPI = {
  getAll: (params) => apiClient.get('/subjects', { params }),
  getById: (id) => apiClient.get(`/subjects/${id}`),
  create: (subjectData) => apiClient.post('/subjects', subjectData),
  update: (id, subjectData) => apiClient.put(`/subjects/${id}`, subjectData),
  delete: (id) => apiClient.delete(`/subjects/${id}`),
};

export const classesAPI = {
  getAll: (params) => apiClient.get('/classes', { params }),
  getById: (id) => apiClient.get(`/classes/${id}`),
  create: (classData) => apiClient.post('/classes', classData),
  update: (id, classData) => apiClient.put(`/classes/${id}`, classData),
  delete: (id) => apiClient.delete(`/classes/${id}`),
};

export const substitutionsAPI = {
  getAll: (params) => apiClient.get('/substitutions', { params }),
  getById: (id) => apiClient.get(`/substitutions/${id}`),
  create: (substitutionData) => apiClient.post('/substitutions', substitutionData),
  update: (id, substitutionData) => apiClient.put(`/substitutions/${id}`, substitutionData),
  delete: (id) => apiClient.delete(`/substitutions/${id}`),
  approve: (id) => apiClient.put(`/substitutions/${id}/approve`),
  reject: (id) => apiClient.put(`/substitutions/${id}/reject`),
};

export const timetablesAPI = {
  getAll: (params) => apiClient.get('/timetables', { params }),
  getById: (id) => apiClient.get(`/timetables/${id}`),
  create: (timetableData) => apiClient.post('/timetables', timetableData),
  update: (id, timetableData) => apiClient.put(`/timetables/${id}`, timetableData),
  delete: (id) => apiClient.delete(`/timetables/${id}`),
  generate: (data) => apiClient.post('/timetables/generate', data),
};

export const schedulesAPI = {
  getAll: (params) => apiClient.get('/schedules', { params }),
  getDashboard: () => apiClient.get('/schedules/dashboard'),
  getFacultyDashboard: () => apiClient.get('/schedules/faculty/dashboard'),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  create: (scheduleData) => apiClient.post('/schedules', scheduleData),
  update: (id, scheduleData) => apiClient.put(`/schedules/${id}`, scheduleData),
  delete: (id) => apiClient.delete(`/schedules/${id}`),
  requestSubstitution: (id, data) => apiClient.post(`/schedules/${id}/substitute`, data),
};

export const specialClassesAPI = {
  getAll: (params) => apiClient.get('/special-classes', { params }),
  getById: (id) => apiClient.get(`/special-classes/${id}`),
  create: (specialClassData) => apiClient.post('/special-classes', specialClassData),
  update: (id, specialClassData) => apiClient.put(`/special-classes/${id}`, specialClassData),
  delete: (id) => apiClient.delete(`/special-classes/${id}`),
  register: (id) => apiClient.post(`/special-classes/${id}/register`),
  unregister: (id) => apiClient.delete(`/special-classes/${id}/register`),
  getUpcoming: (params) => apiClient.get('/special-classes/upcoming', { params }),
};

export const notificationsAPI = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  create: (notificationData) => apiClient.post('/notifications', notificationData),
}; 
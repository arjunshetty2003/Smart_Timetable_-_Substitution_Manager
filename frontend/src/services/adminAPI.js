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

// ===== ADMIN DATABASE OPERATIONS =====

// 1. USER MANAGEMENT (Admin can manage all users)
export const adminUsersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getAvailableFaculty: (params) => api.get('/users/faculty/available', { params }),
  getFacultyList: () => api.get('/users?role=faculty'),
  getStudentList: () => api.get('/users?role=student'),
};

// 2. SUBJECT MANAGEMENT (Admin manages all subjects)
export const adminSubjectsAPI = {
  getAllSubjects: (params) => api.get('/subjects', { params }),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  updateSubject: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

// 3. CLASS MANAGEMENT (Admin manages all classes)
export const adminClassesAPI = {
  getAllClasses: (params) => api.get('/classes', { params }),
  getClassById: (id) => api.get(`/classes/${id}`),
  createClass: (classData) => api.post('/classes', classData),
  updateClass: (id, classData) => api.put(`/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/classes/${id}`),
};

// 4. TIMETABLE MANAGEMENT (Admin creates and manages all timetables)
export const adminTimetablesAPI = {
  getAllTimetables: (params) => api.get('/timetables', { params }),
  getTimetableById: (id) => api.get(`/timetables/${id}`),
  createTimetable: (timetableData) => api.post('/timetables', timetableData),
  updateTimetable: (id, timetableData) => api.put(`/timetables/${id}`, timetableData),
  deleteTimetable: (id) => api.delete(`/timetables/${id}`),
  generateTimetable: (data) => api.post('/timetables/generate', data),
  getDashboardStats: () => api.get('/schedules/dashboard'),
};

// 5. SUBSTITUTION MANAGEMENT (Admin approves/rejects substitutions)
export const adminSubstitutionsAPI = {
  getAllSubstitutions: (params) => api.get('/substitutions', { params }),
  getSubstitutionById: (id) => api.get(`/substitutions/${id}`),
  createSubstitution: (substitutionData) => api.post('/substitutions', substitutionData),
  updateSubstitution: (id, substitutionData) => api.put(`/substitutions/${id}`, substitutionData),
  deleteSubstitution: (id) => api.delete(`/substitutions/${id}`),
  approveSubstitution: (id) => api.put(`/substitutions/${id}/approve`),
  rejectSubstitution: (id) => api.put(`/substitutions/${id}/reject`),
  getPendingSubstitutions: () => api.get('/substitutions?status=pending'),
};

// 6. SPECIAL CLASSES MANAGEMENT (Admin manages special classes)
export const adminSpecialClassesAPI = {
  getAllSpecialClasses: (params) => api.get('/special-classes', { params }),
  getSpecialClassById: (id) => api.get(`/special-classes/${id}`),
  createSpecialClass: (specialClassData) => api.post('/special-classes', specialClassData),
  updateSpecialClass: (id, specialClassData) => api.put(`/special-classes/${id}`, specialClassData),
  deleteSpecialClass: (id) => api.delete(`/special-classes/${id}`),
  getUpcomingSpecialClasses: (params) => api.get('/special-classes/upcoming', { params }),
};

// 7. NOTIFICATIONS MANAGEMENT (Admin sends notifications to all users)
export const adminNotificationsAPI = {
  getAllNotifications: (params) => api.get('/notifications', { params }),
  createNotification: (notificationData) => api.post('/notifications', notificationData),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// 8. SYSTEM ANALYTICS (Admin views system-wide reports)
export const adminAnalyticsAPI = {
  getDashboardStats: () => api.get('/schedules/dashboard'),
  getSystemHealth: () => api.get('/health'),
  getUserStats: () => api.get('/analytics/users'),
  getTimetableStats: () => api.get('/analytics/timetables'),
  getSubstitutionStats: () => api.get('/analytics/substitutions'),
};

export default {
  users: adminUsersAPI,
  subjects: adminSubjectsAPI,
  classes: adminClassesAPI,
  timetables: adminTimetablesAPI,
  substitutions: adminSubstitutionsAPI,
  specialClasses: adminSpecialClassesAPI,
  notifications: adminNotificationsAPI,
  analytics: adminAnalyticsAPI,
}; 
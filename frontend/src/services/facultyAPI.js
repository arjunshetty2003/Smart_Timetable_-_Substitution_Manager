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

// ===== FACULTY DATABASE OPERATIONS =====

// 1. TIMETABLE VIEWING (Faculty can view their assigned timetables)
export const facultyTimetablesAPI = {
  getMyTimetables: (facultyId, params) => api.get('/timetables', { 
    params: { facultyId, ...params } 
  }),
  getTimetableById: (id) => api.get(`/timetables/${id}`),
  getWeeklySchedule: (facultyId) => api.get('/timetables', { 
    params: { facultyId } 
  }),
  getTodayClasses: (facultyId) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return api.get('/timetables', { 
      params: { facultyId, day: today } 
    });
  },
};

// 2. SUBSTITUTION REQUESTS (Faculty can create substitution requests)
export const facultySubstitutionsAPI = {
  createSubstitutionRequest: (substitutionData) => api.post('/substitutions', substitutionData),
  getMySubstitutionRequests: (facultyId) => api.get('/substitutions', { 
    params: { originalFacultyId: facultyId } 
  }),
  getSubstitutionById: (id) => api.get(`/substitutions/${id}`),
  updateSubstitutionRequest: (id, substitutionData) => api.put(`/substitutions/${id}`, substitutionData),
  cancelSubstitutionRequest: (id) => api.delete(`/substitutions/${id}`),
  
  // Mark unavailability (creates substitution request)
  markUnavailable: (unavailabilityData) => api.post('/substitutions', {
    ...unavailabilityData,
    status: 'pending'
  }),
  
  // Cancel class (creates substitution request with cancellation reason)
  cancelClass: (cancellationData) => api.post('/substitutions', {
    ...cancellationData,
    status: 'pending'
  }),
};

// 3. SPECIAL CLASSES (Faculty can create and manage special classes)
export const facultySpecialClassesAPI = {
  createSpecialClass: (specialClassData) => api.post('/special-classes', specialClassData),
  getMySpecialClasses: (facultyId) => api.get('/special-classes', { 
    params: { facultyId } 
  }),
  getSpecialClassById: (id) => api.get(`/special-classes/${id}`),
  updateSpecialClass: (id, specialClassData) => api.put(`/special-classes/${id}`, specialClassData),
  deleteSpecialClass: (id) => api.delete(`/special-classes/${id}`),
  getUpcomingSpecialClasses: (facultyId) => api.get('/special-classes/upcoming', { 
    params: { facultyId } 
  }),
  
  // Add class (creates special class)
  addClass: (classData) => api.post('/special-classes', {
    ...classData,
    type: 'extra_class'
  }),
};

// 4. SUBJECTS (Faculty can view subjects they teach)
export const facultySubjectsAPI = {
  getAllSubjects: () => api.get('/subjects'),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  getMySubjects: (facultyId) => api.get('/subjects', { 
    params: { facultyId } 
  }),
};

// 5. CLASSES (Faculty can view classes they teach)
export const facultyClassesAPI = {
  getAllClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  getMyClasses: (facultyId) => api.get('/classes', { 
    params: { facultyId } 
  }),
};

// 6. NOTIFICATIONS (Faculty can view notifications)
export const facultyNotificationsAPI = {
  getMyNotifications: (facultyId) => api.get('/notifications', { 
    params: { recipientId: facultyId } 
  }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// 7. PROFILE MANAGEMENT (Faculty can update their profile)
export const facultyProfileAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Availability management
  updateAvailability: (availabilityData) => api.put('/auth/profile', {
    availability: availabilityData
  }),
  getAvailability: () => api.get('/auth/me'),
};

// 8. DASHBOARD DATA (Faculty dashboard statistics)
export const facultyDashboardAPI = {
  getDashboardStats: () => api.get('/schedules/faculty/dashboard'),
  getTodaySchedule: (facultyId) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return api.get('/timetables', { 
      params: { facultyId, day: today } 
    });
  },
  getWeeklyStats: (facultyId) => api.get('/analytics/faculty/weekly', {
    params: { facultyId }
  }),
  getPendingRequests: (facultyId) => api.get('/substitutions', {
    params: { originalFacultyId: facultyId, status: 'pending' }
  }),
};

export default {
  timetables: facultyTimetablesAPI,
  substitutions: facultySubstitutionsAPI,
  specialClasses: facultySpecialClassesAPI,
  subjects: facultySubjectsAPI,
  classes: facultyClassesAPI,
  notifications: facultyNotificationsAPI,
  profile: facultyProfileAPI,
  dashboard: facultyDashboardAPI,
}; 
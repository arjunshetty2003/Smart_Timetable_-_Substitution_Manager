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

// ===== STUDENT DATABASE OPERATIONS =====

// 1. TIMETABLE VIEWING (Students can view their class timetables)
export const studentTimetablesAPI = {
  getMyTimetables: (studentId, params) => {
    // Students view timetables by their class/department
    return api.get('/timetables', { 
      params: { studentId, ...params } 
    });
  },
  getTimetableByClass: (classId) => api.get('/timetables', { 
    params: { classId } 
  }),
  getWeeklySchedule: (classId) => api.get('/timetables', { 
    params: { classId } 
  }),
  getTodayClasses: (classId) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return api.get('/timetables', { 
      params: { classId, day: today } 
    });
  },
  getTimetableById: (id) => api.get(`/timetables/${id}`),
};

// 2. SPECIAL CLASSES (Students can view and register for special classes)
export const studentSpecialClassesAPI = {
  getAllAvailableSpecialClasses: () => api.get('/special-classes'),
  getSpecialClassById: (id) => api.get(`/special-classes/${id}`),
  registerForSpecialClass: (id) => api.post(`/special-classes/${id}/register`),
  unregisterFromSpecialClass: (id) => api.delete(`/special-classes/${id}/register`),
  getMyRegisteredSpecialClasses: (studentId) => api.get('/special-classes', { 
    params: { studentId, registered: true } 
  }),
  getUpcomingSpecialClasses: () => api.get('/special-classes/upcoming'),
  
  // Search and filter special classes
  searchSpecialClasses: (searchTerm) => api.get('/special-classes', {
    params: { search: searchTerm }
  }),
  getSpecialClassesBySubject: (subjectId) => api.get('/special-classes', {
    params: { subjectId }
  }),
};

// 3. SUBJECTS (Students can view available subjects)
export const studentSubjectsAPI = {
  getAllSubjects: () => api.get('/subjects'),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  getSubjectsByDepartment: (department) => api.get('/subjects', { 
    params: { department } 
  }),
  getSubjectsBySemester: (semester) => api.get('/subjects', { 
    params: { semester } 
  }),
};

// 4. CLASSES (Students can view class information)
export const studentClassesAPI = {
  getAllClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  getMyClass: (studentId) => api.get('/classes', { 
    params: { studentId } 
  }),
  getClassesByDepartment: (department) => api.get('/classes', { 
    params: { department } 
  }),
  getClassesBySemester: (semester) => api.get('/classes', { 
    params: { semester } 
  }),
};

// 5. NOTIFICATIONS (Students can view notifications)
export const studentNotificationsAPI = {
  getMyNotifications: (studentId) => api.get('/notifications', { 
    params: { recipientId: studentId } 
  }),
  getAllNotifications: () => api.get('/notifications', {
    params: { public: true }
  }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: (studentId) => api.get('/notifications/unread-count', {
    params: { recipientId: studentId }
  }),
};

// 6. PROFILE MANAGEMENT (Students can update their profile)
export const studentProfileAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Academic information
  updateAcademicInfo: (academicData) => api.put('/auth/profile', {
    academicInfo: academicData
  }),
  getAcademicProgress: () => api.get('/auth/me'),
};

// 7. DASHBOARD DATA (Student dashboard statistics)
export const studentDashboardAPI = {
  getDashboardStats: (studentId) => api.get('/schedules/student/dashboard', {
    params: { studentId }
  }),
  getTodaySchedule: (classId) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return api.get('/timetables', { 
      params: { classId, day: today } 
    });
  },
  getWeeklyStats: (studentId) => api.get('/analytics/student/weekly', {
    params: { studentId }
  }),
  getUpcomingEvents: (studentId) => api.get('/events/upcoming', {
    params: { studentId }
  }),
};

// 8. SUBSTITUTIONS (Students can view substitution notifications)
export const studentSubstitutionsAPI = {
  getMyClassSubstitutions: (classId) => api.get('/substitutions', {
    params: { classId, status: 'approved' }
  }),
  getSubstitutionById: (id) => api.get(`/substitutions/${id}`),
  getSubstitutionNotifications: (studentId) => api.get('/substitutions/notifications', {
    params: { studentId }
  }),
  
  // View cancelled/rescheduled classes
  getCancelledClasses: (classId) => api.get('/substitutions', {
    params: { classId, type: 'cancellation' }
  }),
  getRescheduledClasses: (classId) => api.get('/substitutions', {
    params: { classId, type: 'reschedule' }
  }),
};

// 9. ACADEMIC RESOURCES (Students can view academic resources)
export const studentAcademicAPI = {
  getAcademicCalendar: () => api.get('/academic/calendar'),
  getExamSchedule: (studentId) => api.get('/academic/exams', {
    params: { studentId }
  }),
  getAssignments: (studentId) => api.get('/academic/assignments', {
    params: { studentId }
  }),
  getGrades: (studentId) => api.get('/academic/grades', {
    params: { studentId }
  }),
  getAttendance: (studentId) => api.get('/academic/attendance', {
    params: { studentId }
  }),
};

export default {
  timetables: studentTimetablesAPI,
  specialClasses: studentSpecialClassesAPI,
  subjects: studentSubjectsAPI,
  classes: studentClassesAPI,
  notifications: studentNotificationsAPI,
  profile: studentProfileAPI,
  dashboard: studentDashboardAPI,
  substitutions: studentSubstitutionsAPI,
  academic: studentAcademicAPI,
}; 
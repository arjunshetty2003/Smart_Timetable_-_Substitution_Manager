import apiClient from './api';

// Admin Dashboard API
export const adminDashboardAPI = {
  getAll: () => apiClient.get('/schedules/dashboard'),
  getStats: () => apiClient.get('/analytics/dashboard'),
  getUserStats: () => apiClient.get('/analytics/users'),
  getTimetableStats: () => apiClient.get('/analytics/timetables'),
  getSubstitutionStats: () => apiClient.get('/analytics/substitutions'),
};

export default adminDashboardAPI; 
/**
 * Application configuration
 */

// API base URL - will use environment variable in production or default to relative path in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Authentication configuration
export const AUTH_CONFIG = {
  tokenKey: 'authToken',
  userKey: 'user',
  refreshThreshold: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SCHEDULE: '/schedule',
  UNAUTHORIZED: '/unauthorized',
};

// Default pagination
export const DEFAULT_PAGINATION = {
  limit: 10,
  page: 1,
}; 
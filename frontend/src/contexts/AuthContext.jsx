import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          // If we have a saved user, use it immediately to prevent logout flash
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user },
              });
            } catch (parseError) {
              console.error('Error parsing saved user:', parseError);
            }
          }
          
          // Then verify with server (with longer timeout for slow connections)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Authentication check timeout')), 15000)
          );
          
          const authPromise = authService.getCurrentUser();
          const response = await Promise.race([authPromise, timeoutPromise]);
          
          // Update with fresh user data from server
          const userData = response.data.data || response.data.user;
          localStorage.setItem('user', JSON.stringify(userData));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // Only clear auth if it's a real auth error, not a network timeout
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
          } else {
            // For network errors, just stop loading but keep user logged in
            console.warn('Network error during auth check, keeping user logged in');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } else {
        // No token, clear any saved user data
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(email, password);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user },
      });
      
      toast.success(`Welcome back, ${response.data.user.name}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.register(userData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user },
      });
      
      toast.success(`Welcome, ${response.data.user.name}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data,
      });
      toast.success('Profile updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
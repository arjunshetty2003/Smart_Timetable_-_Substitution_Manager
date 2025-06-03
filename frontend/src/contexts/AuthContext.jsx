import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Use the correct endpoint with Authorization header
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Authentication failed');
          }
          return response.json();
        })
        .then(data => {
          console.log("Auth check response:", data);
          if (data.success) {
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            throw new Error(data.message || 'Authentication failed');
          }
        })
        .catch((error) => {
          console.error("Auth check error:", error);
          // Don't remove token right away on error - this causes disappearing on refresh
          // Instead, we'll try again if needed
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      
      // Use fetch directly to avoid axios issues
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        toast.error(errorData.message || 'Login failed. Please try again.');
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log("Login successful:", data);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response) {
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
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
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
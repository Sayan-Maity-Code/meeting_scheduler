import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Load user from localStorage and verify with backend on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const { data } = await axios.get(`${API_URL}/auth/profile`);
        
        if (data.success) {
          setUser(data.user);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Authentication error:', error.message);
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [API_URL]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if the backend is accessible first
      try {
        await axios.get(`${API_URL}/health`);
      } catch (healthError) {
        throw new Error('Backend server is not running. Please start the server and try again.');
      }

      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (data.success) {
        // Set token in localStorage
        localStorage.setItem('token', data.token);
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Get user profile
        const profileResponse = await axios.get(`${API_URL}/auth/profile`);
        
        if (profileResponse.data.success) {
          setUser(profileResponse.data.user);
          toast.success('Registration successful!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      const errorMessage = error.message === 'Network Error' 
        ? 'Unable to connect to the server. Please ensure the backend is running.'
        : error.response?.data?.message || error.message;
      
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if the backend is accessible first
      try {
        await axios.get(`${API_URL}/health`);
      } catch (healthError) {
        throw new Error('Backend server is not running. Please start the server and try again.');
      }

      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (data.success) {
        // Set token in localStorage
        localStorage.setItem('token', data.token);
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Get user profile
        const profileResponse = await axios.get(`${API_URL}/auth/profile`);
        
        if (profileResponse.data.success) {
          setUser(profileResponse.data.user);
          toast.success('Login successful!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      const errorMessage = error.message === 'Network Error' 
        ? 'Unable to connect to the server. Please ensure the backend is running.'
        : error.response?.data?.message || error.message;
      
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/logout`);
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Clear token from axios defaults
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear user state
      setUser(null);
      
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      toast.error('Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
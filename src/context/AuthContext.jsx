import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Configure API with token on auth state change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [currentUser]);

  // Load user from JWT on app start
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token is valid by decoding it
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired, logging out');
            localStorage.removeItem('token');
            setCurrentUser(null);
          } else {
            console.log('Valid token found, setting user:', decoded);
            setCurrentUser(decoded);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Only verify with backend if admin
            if (decoded.role === 'admin') {
              try {
                await api.get('/users/me');
              } catch (verifyErr) {
                console.error('Token verification failed:', verifyErr);
                if (verifyErr.response && verifyErr.response.status === 401) {
                  console.log('Token rejected by server, logging out');
                  localStorage.removeItem('token');
                  setCurrentUser(null);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setCurrentUser(null);
        setAuthError('Authentication error. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Helper to login: store token and user
  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      const user = jwtDecode(token);
      console.log('Login: decoded user from token:', user);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setAuthError(null);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Login failed. Please try again.');
      return null;
    }
  };

  // Helper to logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      login, 
      logout, 
      loading, 
      authError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

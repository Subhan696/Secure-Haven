import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Updated to match backend port
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Format error message for UI
    const errorMessage = 
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Something went wrong';
    
    return Promise.reject({
      message: errorMessage,
      errors: error.response?.data?.errors || [],
      status: error.response?.status
    });
  }
);

export default api;

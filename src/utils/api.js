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
    let errorMessage = 'Something went wrong';
    let errors = [];
    
    if (error.response && error.response.data) {
      // Handle validation errors
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        errors = error.response.data.errors;
        errorMessage = errors.map(err => err.msg).join(', ');
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject({
      message: errorMessage,
      errors: errors,
      status: error.response?.status
    });
  }
);

export default api;

// Contact API functions
export const submitContactForm = async (contactData) => {
  try {
    const response = await api.post('/contact/submit', contactData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

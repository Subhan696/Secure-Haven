import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Signup.css';

function PasswordStrengthMeter({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { label: '', color: '' };
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', color: '#e74c3c' };
    if (score === 2) return { label: 'Medium', color: '#f1c40f' };
    if (score >= 3) return { label: 'Strong', color: '#2ecc71' };
    return { label: '', color: '' };
  };
  const { label, color } = getStrength(password);
  return (
    <div className="password-strength-meter" style={{ height: '18px', marginTop: '0.5rem' }}>
      {label && (
        <span style={{ color, fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
      )}
    </div>
  );
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Effect for the loading progress bar
  useEffect(() => {
    let progressInterval;
    
    if (isLoading) {
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10; // Increment by 10% every interval
        });
      }, 100); // Update every 100ms to complete in 1 second
    } else {
      setLoadingProgress(0);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading]);
  
  // Effect to navigate after loading completes
  useEffect(() => {
    if (loadingProgress === 100) {
      const timer = setTimeout(() => {
        if (isLoading) {
          // This will only execute if we haven't already set isLoading to false
          // which would happen if there was an error
          setIsLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength (basic frontend validation)
      // Note: The backend will do more thorough validation
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Register user with backend API
      const response = await api.post('/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin' // Set role to admin for users who sign up through the portal
      });
      
      // If registration returns a token (auto-login), use it
      if (response.data && response.data.token) {
        // Import AuthContext and use login function if needed
        // login(response.data.token);
        // navigate('/dashboard');
        
        // For now, just redirect to login
        navigate('/login', { 
          state: { message: 'Registration successful! You can now log in.' } 
        });
      } else {
        // Otherwise just redirect to login
        navigate('/login', { 
          state: { message: 'Registration successful! You can now log in.' } 
        });
      }
    } catch (err) {
      // Use our improved error handling from the API utility
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
     
      <div className="signup-container" style={{ minHeight: '100vh', width: '100vw', position: 'relative', zIndex: 1 }}>

      <div className={`signup-card ${isLoading ? 'loading' : ''}`}>
        <h1>Create Account</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
  <input
    className="form-input"
    type="text"
    id="name"
    name="name"
    value={formData.name}
    onChange={handleChange}
    required
    placeholder=" "
    autoComplete="off"
  />
  <label className="form-label" htmlFor="name">Full Name</label>
</div>
          <div className="form-group">
  <input
    className="form-input"
    type="email"
    id="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    required
    placeholder=" "
    autoComplete="off"
  />
  <label className="form-label" htmlFor="email">Email</label>
</div>
          <div className="form-group">
  <input
    className="form-input"
    type="password"
    id="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    required
    placeholder=" "
    autoComplete="off"
  />
  <label className="form-label" htmlFor="password">Password</label>
  <PasswordStrengthMeter password={formData.password} />
</div>
          <div className="form-group">
  <input
    className="form-input"
    type="password"
    id="confirmPassword"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    required
    placeholder=" "
    autoComplete="off"
  />
  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
</div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-container">
                <div className="modern-spinner">
                  <div className="modern-spinner-ring"></div>
                </div>
                <span>Loading...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
          {isLoading && (
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
    </>
  );
};

export default Signup;

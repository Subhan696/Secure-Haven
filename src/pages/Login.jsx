import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

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

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'voter'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    voterKey: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [userInfo, setUserInfo] = useState(null);

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
      if (loginType === 'admin') {
        // Admin login using backend API
        const res = await api.post('/users/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Store token and user info
        if (res.data.token) {
          login(res.data.token);
          setUserInfo(res.data.user);
          
          // Log user information for debugging
          console.log('User role from API:', res.data.user.role);
          
          // Use the role-based redirect component
          console.log('Redirecting to role-based redirect component');
          setTimeout(() => navigate('/redirect'), 250);
        } else {
          setError('No token received from backend.');
        }
      } else {
        // Voter login using email and voter key
        try {
          const res = await api.post('/votes/login', {
            email: formData.email,
            voterKey: formData.voterKey
          });
          
          if (res.data.token) {
            // Store token and voter info
            login(res.data.token);
            setUserInfo({
              role: 'voter',
              email: formData.email,
              electionId: res.data.electionId
            });
            
            // Redirect to voter dashboard page
            setTimeout(() => navigate('/voter-dashboard'), 250);
          } else {
            setError('Invalid voter credentials. Please check your email and voter key.');
          }
        } catch (err) {
          console.error('Voter login error:', err);
          setError('Invalid voter credentials or the election is not currently active.');
        }
      }
    } catch (err) {
      // Use the error handling from our updated API utility
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
     
      <div className="login-container" style={{ minHeight: '100vh', width: '100vw', position: 'relative', zIndex: 1 }}>

      <div className={`login-card ${isLoading ? 'loading' : ''}`}>
        <h1>Welcome Back</h1>
        <div className="login-type-toggle">
          <button
            className={loginType === 'admin' ? 'active' : ''}
            onClick={() => setLoginType('admin')}
          >
            Admin Login
          </button>
          <button
            className={loginType === 'voter' ? 'active' : ''}
            onClick={() => setLoginType('voter')}
          >
            Voter Login
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
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
          {loginType === 'admin' ? (
            <>
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
              <div className="forgot-password-link">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </>
          ) : (
            <div className="form-group">
  <input
    className="form-input"
    type="text"
    id="voterKey"
    name="voterKey"
    value={formData.voterKey}
    onChange={handleChange}
    required
    placeholder=" "
    autoComplete="off"
  />
  <label className="form-label" htmlFor="voterKey">Voter Key</label>
</div>
          )}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-container">
                <div className="modern-spinner">
                  <div className="modern-spinner-ring"></div>
                </div>
                <span>Loading...</span>
              </div>
            ) : (
              loginType === 'admin' ? 'Log In' : 'Access Election'
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
        {loginType === 'admin' && (
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default Login;

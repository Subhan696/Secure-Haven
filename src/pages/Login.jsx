import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (loginType === 'admin') {
      // Admin login
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);

      if (!user) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userEmail', user.email);
      
      // Navigation will happen after progress bar completes
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      // Voter login
      const elections = JSON.parse(localStorage.getItem('elections') || '[]');
      const election = elections.find(election => 
        election.voters.some(voter => 
          voter.email === formData.email && voter.key === formData.voterKey
        )
      );

      if (!election || !election.voters.find(voter => voter.email === formData.email && voter.key === formData.voterKey)) {
        setError('Invalid voter credentials');
        setIsLoading(false);
        return;
      }

      // Set voter session
      const voter = election.voters.find(v => v.email === formData.email);
      const voterUser = { email: voter.email, role: 'voter' };
      localStorage.setItem('currentUser', JSON.stringify(voterUser));
      localStorage.setItem('userEmail', voter.email);
      
      // Navigation will happen after progress bar completes
      setTimeout(() => {
        navigate(`/voter-election/${election.id}`);
      }, 1000);
    }
  };

  return (
    <div className="login-container">
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          {loginType === 'admin' ? (
            <>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <div className="forgot-password-link">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="voterKey">Voter Key</label>
              <input
                type="text"
                id="voterKey"
                name="voterKey"
                value={formData.voterKey}
                onChange={handleChange}
                required
                placeholder="Enter your voter key"
              />
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
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
  );
};

export default Login;

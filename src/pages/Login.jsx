import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const EmailVerification = ({ email, onClose }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState(email || '');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const res = await api.post('/users/verify-email', { email: inputEmail, code });
      if (res.data && res.data.message) {
        onClose('Email verified! You can now log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    setResendLoading(true);
    try {
      const res = await api.post('/users/resend-verification', { email: inputEmail });
      setResendMsg(res.data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>Verify Your Email</h2>
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <input
            className="form-input"
            type="email"
            value={inputEmail}
            onChange={e => setInputEmail(e.target.value)}
            required
            placeholder="Email"
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <input
            className="form-input"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            placeholder="Verification Code"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <button type="button" onClick={handleResend} disabled={resendLoading} style={{marginTop:8}}>
        {resendLoading ? 'Resending...' : 'Resend Code'}
      </button>
      {resendMsg && <div style={{ color: 'green', marginTop: 8 }}>{resendMsg}</div>}
      {error && <div className="error-message">{error}</div>}
      <button type="button" onClick={() => onClose()} style={{marginTop:8}}>Back to Login</button>
    </div>
  );
};

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
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const emailInputRef = useRef();

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
    setSuccessMsg('');
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
            setTimeout(() => navigate('/voter/dashboard'), 250);
          } else {
            setError('Invalid voter credentials. Please check your email and voter key.');
          }
        } catch (err) {
          console.error('Voter login error:', err);
          setError('Invalid voter credentials or the election is not currently active.');
        }
      }
    } catch (err) {
      console.log('Login error object:', err);
      // If error is due to unverified email, redirect to verification page
      if (
        err.message === 'Please verify your email before logging in.' ||
        err.response?.data?.message === 'Please verify your email before logging in.'
      ) {
        console.log('Redirecting to verification page:', formData.email);
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return <EmailVerification email={verifyEmail} onClose={(msg) => {
      setShowVerification(false);
      if (msg) setSuccessMsg(msg);
    }} />;
  }

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
        {successMsg && <div className="success-message">{successMsg}</div>}
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
            {isLoading ? 'Loading...' : (loginType === 'admin' ? 'Log In' : 'Access Election')}
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

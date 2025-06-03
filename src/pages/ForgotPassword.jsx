import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    api.post('/password-reset/request', { email })
      .then(() => {
        setMessage('If an account exists, a verification code will be sent to your email.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      })
      .catch(() => {
        setMessage('If an account exists, a verification code will be sent to your email.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Reset Password</h1>
        <p>Enter your email address to receive a verification code.</p>
        
        {message && <div className="message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
        
        <p className="back-to-login">
          Remember your password? <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 
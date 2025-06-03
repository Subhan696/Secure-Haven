import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    api.post('/password-reset/reset', {
      email,
      verificationCode,
      newPassword
    })
      .then(() => {
        setMessage('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch((error) => {
        setMessage(
          error.response?.data?.message || 'Invalid or expired verification code.'
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1>Reset Password</h1>
        <p>Enter the verification code sent to your email and your new password.</p>
        
        {message && <div className="message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder="Enter verification code"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="8"
              placeholder="Enter new password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="8"
              placeholder="Confirm new password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="back-to-login">
          Remember your password? <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword; 
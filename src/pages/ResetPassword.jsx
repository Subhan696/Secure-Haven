import React, { useState, useEffect } from 'react';
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

    try {
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

      // Get reset request
      const resetRequests = JSON.parse(localStorage.getItem('resetRequests') || '{}');
      const resetRequest = resetRequests[email];

      if (!resetRequest) {
        setMessage('Invalid or expired reset request');
        setLoading(false);
        return;
      }

      // Check if code is expired
      if (new Date() > new Date(resetRequest.expires)) {
        setMessage('Verification code has expired');
        setLoading(false);
        return;
      }

      // Check if code matches
      if (resetRequest.verificationCode !== verificationCode) {
        resetRequest.attempts++;
        localStorage.setItem('resetRequests', JSON.stringify(resetRequests));
        
        if (resetRequest.attempts >= 3) {
          setMessage('Too many failed attempts. Please request a new code.');
          setLoading(false);
          return;
        }
        
        setMessage('Invalid verification code');
        setLoading(false);
        return;
      }

      // Update password
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        setMessage('User not found');
        setLoading(false);
        return;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      // Remove reset request
      delete resetRequests[email];
      localStorage.setItem('resetRequests', JSON.stringify(resetRequests));

      setMessage('Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
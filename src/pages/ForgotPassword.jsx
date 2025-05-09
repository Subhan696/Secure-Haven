import React, { useState } from 'react';
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

    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
        setMessage('If an account exists, a verification code will be sent to your email.');
        setLoading(false);
        return;
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store reset request
      const resetRequests = JSON.parse(localStorage.getItem('resetRequests') || '{}');
      resetRequests[email] = {
        verificationCode,
        expires: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes
        attempts: 0
      };
      
      localStorage.setItem('resetRequests', JSON.stringify(resetRequests));
      
      // In a real app, this would send an email
      console.log(`Verification code for ${email}: ${verificationCode}`);
      
      // Navigate to reset password page with email
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
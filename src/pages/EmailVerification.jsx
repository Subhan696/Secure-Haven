import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import './Signup.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EmailVerification = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const emailFromQuery = query.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const res = await api.post('/users/verify-email', { email, code });
      if (res.data && res.data.message) {
        navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
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
      const res = await api.post('/users/resend-verification', { email });
      setResendMsg(res.data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="signup-container" style={{ minHeight: '100vh', width: '100vw', position: 'relative', zIndex: 1 }}>
      <div className="signup-card">
        <h1>Email Verification</h1>
        <p style={{textAlign:'center',marginBottom:'1.5rem'}}>Enter the code sent to your Gmail to verify your account.</p>
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder=" "
              autoComplete="off"
            />
            <label className="form-label" htmlFor="email">Email</label>
          </div>
          <div className="form-group">
            <input
              className="form-input"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              placeholder=" "
              autoComplete="off"
            />
            <label className="form-label" htmlFor="code">Verification Code</label>
          </div>
          <button type="submit" className="btn-primary" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <button type="button" onClick={handleResend} disabled={resendLoading} style={{marginTop:8}} className="btn-primary">
          {resendLoading ? 'Resending...' : 'Resend Code'}
        </button>
        {resendMsg && <div style={{ color: 'green', marginTop: 8 }}>{resendMsg}</div>}
        {error && <div className="error-message">{error}</div>}
        <button type="button" onClick={() => navigate('/login')} style={{marginTop:8}} className="btn-primary">Back to Login</button>
      </div>
    </div>
  );
};

export default EmailVerification; 
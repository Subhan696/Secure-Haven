import React, { useState } from 'react';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (loginType === 'admin') {
      // Admin login
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);

      if (!user) {
        setError('Invalid email or password');
        return;
      }

      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userEmail', user.email);
      navigate('/dashboard');
    } else {
      // Voter login
      const elections = JSON.parse(localStorage.getItem('elections') || '[]');
      const voterElection = elections.find(election => 
        election.voters.some(voter => 
          voter.email === formData.email && voter.key === formData.voterKey
        )
      );

      if (!voterElection) {
        setError('Invalid email or voter key');
        return;
      }

      // Set voter session
      const voter = voterElection.voters.find(v => v.email === formData.email);
      localStorage.setItem('currentUser', JSON.stringify({
        email: voter.email,
        role: 'voter',
        electionId: voterElection.id
      }));
      localStorage.setItem('userEmail', voter.email);
      navigate('/voter-dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
          <button type="submit" className="btn-primary">
            {loginType === 'admin' ? 'Log In' : 'Access Election'}
          </button>
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

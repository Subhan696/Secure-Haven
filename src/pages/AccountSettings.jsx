import React, { useState, useEffect } from 'react';
import './AccountSettings.css';

const AccountSettings = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [previousProfile, setPreviousProfile] = useState({ name: '', email: '' });
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    setProfile({
      name: userData.name || '',
      email: userData.email || ''
    });
    setPreviousProfile({
      name: userData.name || '',
      email: userData.email || ''
    });
    setLoginEmail(localStorage.getItem('userEmail') || '');
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(profile));
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password.new !== password.confirm) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match!'
      });
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <h1>Account Settings</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-section">
        <h2>Profile Information</h2>
        <div className="current-info">
          <div><strong>Current Name:</strong> {previousProfile.name || <em>Not set</em>}</div>
          <div><strong>Current Email:</strong> {loginEmail || <em>Not set</em>}</div>
        </div>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="current">Current Password</label>
            <input
              type="password"
              id="current"
              name="current"
              value={password.current}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="new">New Password</label>
            <input
              type="password"
              id="new"
              name="new"
              value={password.new}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm New Password</label>
            <input
              type="password"
              id="confirm"
              name="confirm"
              value={password.confirm}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings; 
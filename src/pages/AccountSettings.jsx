import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './AccountSettings.css';

const AccountSettings = () => {
  const { currentUser, login, updateCurrentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [previousProfile, setPreviousProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    // Load user data from current user context
    if (currentUser) {
    setProfile({
        name: currentUser.name || '',
        email: currentUser.email || ''
    });
    setPreviousProfile({
        name: currentUser.name || '',
        email: currentUser.email || ''
    });
    }
  }, [currentUser]);

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
    setProfileMessage({ type: '', text: '' });

    try {
      // Call backend API to update profile
      const response = await api.put('/users/me/profile', {
        name: profile.name,
        email: profile.email
      });
      
      // Update the user context with new data and token
      if (response.data && response.data.token) {
        // Update the token and user context with new information
        login(response.data.token);
        
        // Also update the current user immediately for UI responsiveness
        updateCurrentUser({
          name: response.data.user.name,
          email: response.data.user.email
        });
        
        setPreviousProfile({
          name: response.data.user.name,
          email: response.data.user.email
        });
      
        setProfileMessage({
        type: 'success',
          text: response.data.message || 'Profile updated successfully!'
      });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMessage({ type: '', text: '' });

    if (password.new !== password.confirm) {
      setPasswordMessage({
        type: 'error',
        text: 'New passwords do not match!'
      });
      setLoading(false);
      return;
    }

    if (password.new.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long!'
      });
      setLoading(false);
      return;
    }

    // Frontend validation to match backend requirements
    if (!/[a-z]/.test(password.new)) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must contain at least one lowercase letter!'
      });
      setLoading(false);
      return;
    }
    
    if (!/[A-Z]/.test(password.new)) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must contain at least one uppercase letter!'
      });
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(password.new)) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must contain at least one number!'
      });
      setLoading(false);
      return;
    }
    
    if (password.new === password.current) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be different from current password!'
      });
      setLoading(false);
      return;
    }

    try {
      // Call backend API to change password
      await api.put('/users/me/password', {
        currentPassword: password.current,
        newPassword: password.new
      });
      
      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle backend validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg || err.message).join(', ');
        setPasswordMessage({
          type: 'error',
          text: errorMessages
        });
      } else {
        setPasswordMessage({
        type: 'error',
          text: error.response?.data?.message || 'Failed to update password. Please try again.'
      });
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading if user data is not loaded yet
  if (!currentUser) {
    return (
      <div className="account-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-settings">
      <h1>Account Settings</h1>
      
      {profileMessage.text && (
        <div className={`message ${profileMessage.type}`}>
          {profileMessage.text}
        </div>
      )}

      <div className="settings-section">
        <h2>Profile Information</h2>
        <div className="current-info">
          <div><strong>Current Name:</strong> {previousProfile.name || <em>Not set</em>}</div>
          <div><strong>Current Email:</strong> {previousProfile.email || <em>Not set</em>}</div>
          <div><strong>Role:</strong> {currentUser.role || <em>Not set</em>}</div>
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
        {passwordMessage.text && (
          <div className={`message ${passwordMessage.type}`}>
            {passwordMessage.text}
          </div>
        )}
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
            <div className="password-requirements">
              <small>Password must contain at least 8 characters, including:</small>
              <ul>
                <li>One lowercase letter (a-z)</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One number (0-9)</li>
              </ul>
            </div>
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
          <button type="submit" className="btn-change-password" disabled={loading}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings; 
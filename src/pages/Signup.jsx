import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    // Create new user
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password, // In a real app, this should be hashed
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    // Save user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Initialize user's elections array
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const userElections = elections.filter(e => e.createdBy === formData.email);
    if (userElections.length === 0) {
      localStorage.setItem('elections', JSON.stringify([...elections, {
        id: Date.now(),
        title: 'My First Election',
        description: 'Welcome to your first election!',
        createdBy: formData.email,
        createdAt: new Date().toISOString(),
        status: 'draft',
        voters: [],
        candidates: []
      }]));
    }

    // Set current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('userEmail', formData.email);

    // Redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

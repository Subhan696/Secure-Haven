// src/components/RoleBasedRedirect.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (currentUser.role === 'admin') {
      console.log('RoleBasedRedirect: User is admin, redirecting to /dashboard');
      navigate('/dashboard');
    } else {
      console.log('RoleBasedRedirect: User is voter, redirecting to /voter/dashboard');
      navigate('/voter/dashboard');
    }
  }, [currentUser, navigate]);

  // This component doesn't render anything, it just redirects
  return <div className="loading-container">Redirecting...</div>;
};

export default RoleBasedRedirect;

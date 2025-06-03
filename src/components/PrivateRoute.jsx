// src/components/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
        <p style={{ marginLeft: '15px' }}>Verifying authentication...</p>
      </div>
    );
  }
  
  // Check if user is authenticated
  const isAuthenticated = !!currentUser;
  
  // Check if user is an admin
  const isAdmin = currentUser?.role === 'admin';
  
  if (!isAuthenticated) {
    // Not logged in, redirect to login
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    // Logged in but not an admin, redirect to voter dashboard
    console.log('User is not an admin, redirecting to voter dashboard');
    return <Navigate to="/voter-dashboard" replace />;
  }
  
  // User is authenticated and is an admin, allow access to admin routes
  console.log('User is authenticated and is an admin, allowing access');
  return <Outlet />;
};

export default PrivateRoute;

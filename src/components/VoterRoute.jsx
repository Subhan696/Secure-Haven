import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const VoterRoute = () => {
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
  
  // Check if user is a voter
  const isVoter = currentUser?.role === 'voter';
  
  console.log('VoterRoute Debug:', {
    currentUser,
    isAuthenticated,
    userRole: currentUser?.role,
    isVoter
  });
  
  if (!isAuthenticated) {
    // Not logged in, redirect to login
    console.log('VoterRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isVoter) {
    // Logged in but not a voter (e.g., admin), redirect to admin dashboard
    console.log('VoterRoute: User is not a voter, redirecting to admin dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and is a voter, allow access to voter routes
  console.log('VoterRoute: User is authenticated and is a voter, allowing access');
  return <Outlet />;
};

export default VoterRoute; 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoterHeader.css';

const VoterHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const dropdownRef = useRef(null);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Check if user has correct role before navigation
  const navigateWithRoleCheck = (path) => {
    // For voter pages, just navigate directly - we're already in voter context
    if (path.startsWith('/voter')) {
      navigate(path, { state: { force: Date.now() } });
    } 
    // For dashboard pages, ensure the user has the admin role
    else if (path.startsWith('/dashboard')) {
      if (currentUser && currentUser.role === 'admin') {
        navigate(path);
      } else {
        // If not an admin, show message and don't navigate
        alert('You need admin privileges to access this page');
      }
    } else {
      // For other pages, just navigate
      navigate(path);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="voter-header">
      <div className="header-left">
        <h1 onClick={() => navigate('/voter-dashboard')} style={{ cursor: 'pointer' }}>Secure Haven</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-email">{currentUser?.email}</span>
          <span className="user-role">Voter</span>
        </div>
        <div className={`profile-dropdown${isDropdownOpen ? ' open' : ''}`} ref={dropdownRef}>
          <button className="profile-button" onClick={toggleDropdown}>
            <span className="profile-icon">👤</span>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => {
                navigateWithRoleCheck('/voter-dashboard');
                setIsDropdownOpen(false);
              }} className="dropdown-item">
                <span className="dropdown-icon">🏠</span>
                Dashboard
              </button>
              <button onClick={() => {
                navigateWithRoleCheck('/voter-profile');
                setIsDropdownOpen(false);
              }} className="dropdown-item">
                <span className="dropdown-icon">📋</span>
                Voting History
              </button>

              <button onClick={handleLogout} className="dropdown-item">
                <span className="dropdown-icon">🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default VoterHeader; 
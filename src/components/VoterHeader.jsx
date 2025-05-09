import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoterHeader.css';

const VoterHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="voter-header">
      <div className="header-left">
        <h1>Secure Haven</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-email">{currentUser?.email}</span>
          <span className="user-role">Voter</span>
        </div>
        <div className="profile-dropdown">
          <button className="profile-button" onClick={toggleDropdown}>
            <span className="profile-icon">👤</span>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate('/voter-profile')} className="dropdown-item">
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
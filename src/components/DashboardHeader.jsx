import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const DashboardHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header dashboard-header-bar">
      <span className="dashboard-brand">Secure-Haven</span>
      <nav className="header-nav">
        <Link to="/dashboard" className="header-link">Dashboard</Link>
      </nav>
      {currentUser && (
        <div className="header-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="header-user-icon">👤</span>
          <span className="header-username">{currentUser.name || currentUser.email.split('@')[0]}</span>
          {dropdownOpen && (
            <div className="header-dropdown">
              <button onClick={() => { setDropdownOpen(false); navigate('/dashboard/account-settings'); }}>Account Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader; 
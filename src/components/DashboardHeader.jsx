import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

const DashboardHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="main-header dashboard-header-bar">
      <div className="header-left">
        <span className="dashboard-brand">Secure-Haven</span>
        <nav className="header-nav">
          <Link to="/dashboard" className="header-link">Dashboard</Link>
          
        </nav>
      </div>
      {userEmail && (
        <div className="header-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="header-user-icon">📧</span>
          <span className="header-username">{userEmail.split('@')[0]}</span>
          {dropdownOpen && (
            <div className="header-dropdown">
              <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>Account Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader; 
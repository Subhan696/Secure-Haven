import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          <img src={logo} alt="logo" className="header-logo" />
          <nav className="nav-menu">
            <ul className="nav-list">
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/about" className="nav-link">About</Link></li>
              <li><Link to="/contact" className="nav-link">Contact</Link></li>
            </ul>
          </nav>
        </div>
        <div className="header-right">
          {userEmail ? (
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
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

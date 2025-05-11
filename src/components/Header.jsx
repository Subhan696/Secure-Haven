import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const NavigationLinks = () => (
    <>
      <li><Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link></li>
      <li><Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link></li>
      <li><Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link></li>
    </>
  );

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          <img src={logo} alt="logo" className="header-logo" />
          
          {/* Desktop Navigation */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              {!isMobile && <NavigationLinks />}
            </ul>
          </nav>
        </div>
        
        {/* Mobile menu button */}
        <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`header-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {userEmail ? (
            <div className="header-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span className="header-user-icon">📧</span>
              <span className="header-username">{userEmail.split('@')[0]}</span>
              {dropdownOpen && (
                <div className="header-dropdown">
                  <button onClick={() => { setDropdownOpen(false); navigate('/settings'); closeMobileMenu(); }}>Account Settings</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn" onClick={closeMobileMenu}>Login</Link>
              <Link to="/signup" className="signup-btn" onClick={closeMobileMenu}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && mobileMenuOpen && (
        <div className="mobile-nav">
          <ul className="mobile-nav-list">
            <NavigationLinks />
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VoterHeader.css';

const VoterHeader = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    navigate('/login');
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
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default VoterHeader; 
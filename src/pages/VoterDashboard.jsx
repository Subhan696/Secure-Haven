import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const voterEmail = localStorage.getItem('voterEmail');
    if (!voterEmail) {
      navigate('/voter-login');
      return;
    }

    // Get all elections
    const allElections = JSON.parse(localStorage.getItem('elections') || '[]');
    
    // Filter elections that are:
    // 1. Live
    // 2. Include the current voter in their voters list
    const voterElections = allElections.filter(election => {
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      const isLive = now >= startDate && now <= endDate;
      const isVoterIncluded = election.voters?.some(voter => voter.email === voterEmail);
      
      return isLive && isVoterIncluded;
    });

    setElections(voterElections);
  }, [navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredElections = elections.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('voterEmail');
    navigate('/voter-login');
  };

  return (
    <div className="voter-dashboard-container">
      <div className="voter-dashboard-header">
        <h1>Voter Dashboard</h1>
        <div className="voter-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="voter-dashboard-list">
        {filteredElections.length === 0 ? (
          <div className="no-elections">
            <p>No active elections available for you to vote in.</p>
          </div>
        ) : (
          filteredElections.map(election => (
            <div key={election.id} className="election-card">
              <div className="election-card-header">
                <h3>{election.title}</h3>
                <span className="election-status live">Live</span>
              </div>
              <div className="election-card-details">
                <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
                <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
                <p><strong>Total Questions:</strong> {election.questions?.length || 0}</p>
              </div>
              <div className="election-card-actions">
                <button 
                  onClick={() => navigate(`/voter-election/${election.id}`)}
                  className="vote-btn"
                >
                  Vote Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoterDashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'voter') {
      navigate('/login');
      return;
    }

    const voterEmail = currentUser.email;

    // Get all elections
    const allElections = JSON.parse(localStorage.getItem('elections') || '[]');
    
    // Get voting history to check which elections the voter has already voted in
    const votingHistory = JSON.parse(localStorage.getItem('votingHistory') || '[]');
    
    // Filter elections that are:
    // 1. Live (current time is between start and end dates)
    // 2. Actually launched (has the launched flag set to true)
    // 3. Has status explicitly set to 'Live'
    // 4. Include the current voter in their voters list
    const voterElections = allElections.filter(election => {
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      
      // Check if election is truly live
      const isTimeInRange = now >= startDate && now <= endDate;
      const isLaunched = election.launched === true;
      const hasLiveStatus = election.status === 'Live';
      const isVoterIncluded = election.voters?.some(voter => voter.email === voterEmail);
      
      // Only show elections that are truly live and include this voter
      return isTimeInRange && isLaunched && hasLiveStatus && isVoterIncluded;
    }).map(election => {
      // Check if the voter has already voted in this election
      const hasVoted = votingHistory.some(vote => 
        vote.electionId === election.id && vote.voterEmail === voterEmail
      );
      
      // Add hasVoted flag to the election object
      return { ...election, hasVoted };
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="voter-dashboard-container">
      <VoterHeader />
      <div className="voter-dashboard-content">
        <h2>Available Elections</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
                    className={`vote-btn ${election.hasVoted ? 'voted' : ''}`}
                  >
                    {election.hasVoted ? 'Voted' : 'Vote Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import './VoterProfile.css';

const VoterProfile = () => {
  const [previousElections, setPreviousElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Get voting history from localStorage
    const votingHistory = JSON.parse(localStorage.getItem('votingHistory') || '[]');
    const userVotingHistory = votingHistory.filter(vote => 
      vote.voterEmail === currentUser.email && 
      vote.selectedOptions && 
      vote.selectedOptions.length > 0
    );
    
    // Get elections data
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    
    // Combine voting history with election details
    const votedElections = userVotingHistory.map(vote => {
      const election = elections.find(e => e.id === vote.electionId);
      if (!election) return null;

      return {
        id: vote.electionId,
        title: election.title,
        date: vote.timestamp,
        status: election.status,
        position: vote.selectedOptions.map(v => 
          `Voted for: ${election.questions[v.questionIndex].options[v.optionIndex]}`
        ).join(', ')
      };
    }).filter(Boolean); // Remove any null entries

    setPreviousElections(votedElections);
    setLoading(false);
  }, [navigate, currentUser]);

  const handleElectionClick = (electionId) => {
    navigate(`/voter-election/${electionId}`);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <VoterHeader />
      <div className="voter-profile-container">
        <div className="profile-header">
          <h1>My Voting History</h1>
          <p>View all elections you have participated in</p>
        </div>

        <div className="elections-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : previousElections.length === 0 ? (
            <div className="no-elections">
              <p>You haven't participated in any elections yet.</p>
            </div>
          ) : (
            previousElections.map((election) => (
              <div 
                key={election.id} 
                className="election-card"
                onClick={() => handleElectionClick(election.id)}
              >
                <div className="election-info">
                  <h3>{election.title}</h3>
                  <p className="election-date">
                    Voted on: {new Date(election.date).toLocaleDateString()}
                  </p>
                  <p className="election-position">{election.position}</p>
                </div>
                <div className="election-status">
                  <span className={`status-badge ${election.status.toLowerCase()}`}>
                    {election.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterProfile; 
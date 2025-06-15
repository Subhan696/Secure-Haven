import React, { useContext, useEffect, useState } from 'react';
import VoterHeader from '../components/VoterHeader';
import './VoterProfile.css';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const VoterProfile = () => {
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, loading: authLoading, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch user's voting history from the backend
  useEffect(() => {
    // Only redirect if auth is not loading and there's no current user
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    // Only fetch history if user is loaded and not null
    if (currentUser) {
      const fetchVotingHistory = async () => {
        try {
          setLoading(true);
          // Use the /votes/me/history endpoint we created in the backend
          const response = await api.get('/votes/me/history');
          setVotingHistory(response.data);
          setError('');
        } catch (err) {
          console.error('Error fetching voting history:', err);
          setError(err.response?.data?.message || 'Failed to load your voting history. Please try again later.');
          setVotingHistory([]);
        } finally {
          setLoading(false);
        }
      };

      fetchVotingHistory();
    }
  }, [currentUser, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="voter-profile-container">
        <VoterHeader />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || authError) {
    return (
      <div className="voter-profile-container">
        <VoterHeader />
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{error || authError}</p>
          <button onClick={() => navigate('/login')} className="back-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <VoterHeader />
      <div className="voter-profile-container">
        <div className="profile-header">
          <h1>My Voting History</h1>
          <p>See all elections you have participated in and their results.</p>
        </div>
        
        <div className="elections-list">
          {votingHistory.length === 0 ? (
            <div className="no-elections">
              <p>You haven't participated in any elections yet.</p>
            </div>
          ) : (
            votingHistory.map((vote) => (
              <div key={vote._id} className="election-card">
                <div className="election-info">
                  <h3>{vote.election?.title || 'Unknown Election'}</h3>
                  <p className="election-date">
                    Voted on: {new Date(vote.votedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {vote.election?.status && (
                  <div className="election-status">
                    <span className={`status-badge ${vote.election.status.toLowerCase()}`}>
                      {vote.election.status}
                    </span>
                  </div>
                )}
                
                <div className="vote-details">
                  <h4>Your Vote</h4>
                  {vote.resolvedChoices && vote.resolvedChoices.length > 0 ? (
                    vote.resolvedChoices.map((choice, choiceIndex) => (
                      <p key={choiceIndex} className="vote-choice">
                        <strong>{choice.questionText}:</strong> {choice.optionText}
                      </p>
                    ))
                  ) : (
                    <p>No vote details available.</p>
                  )}
                  
                  {/* Link to view full election results */}
                  <div className="view-results">
                    <Link 
                      to={`/voter-election/${vote.election?._id}`} 
                      className="results-link"
                    >
                      View Full Results
                    </Link>
                  </div>
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
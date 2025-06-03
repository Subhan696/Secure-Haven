import React, { useContext, useEffect, useState } from 'react';
import VoterHeader from '../components/VoterHeader';
import './VoterProfile.css';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const VoterProfile = () => {
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);

  // Fetch user's voting history from the backend
  useEffect(() => {
    const fetchVotingHistory = async () => {
      if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      try {
        setLoading(true);
        // Use the /votes/me/history endpoint we created in the backend
        const response = await api.get('/votes/me/history');
        setVotingHistory(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching voting history:', err);
        setError('Failed to load your voting history. Please try again later.');
        setVotingHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVotingHistory();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <VoterHeader />
      <div className="voter-profile-container">
        <div className="profile-header">
          <h1>My Voting History</h1>
          <p>See all elections you have participated in and their results.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="elections-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : votingHistory.length === 0 ? (
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
                  <p>You voted for: <strong>{vote.candidate}</strong></p>
                  
                  {/* Link to view full election results */}
                  <div className="view-results">
                    <a href={`/voter-election-results/${vote.election?._id}`} className="results-link">
                      View Full Results
                    </a>
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
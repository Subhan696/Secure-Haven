import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const [allElections, setAllElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingHistory, setVotingHistory] = useState([]);

  useEffect(() => {
    // Check if user is authenticated and has voter role
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchElections = async () => {
      try {
        setLoading(true);
        
        // Fetch available elections for the voter
        const electionsResponse = await api.get('/elections/available');
        
        // Fetch voting history to check which elections the voter has already voted in
        const votingHistoryResponse = await api.get('/votes/me/history');
        setVotingHistory(votingHistoryResponse.data || []);
        
        // Mark elections that the voter has already voted in
        const voterElections = electionsResponse.data.map(election => {
          // Check if the voter has already voted in this election
          const hasVoted = votingHistoryResponse.data.some(vote => 
            vote.election?._id === election._id
          );
          
          // Add hasVoted flag to the election object
          return { ...election, hasVoted };
        });
        
        setAllElections(voterElections);
        setError('');
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError(err.response?.data?.message || 'Failed to load available elections');
        setAllElections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Always filter from the full list
  const filteredElections = allElections.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    // Clear user session from AuthContext
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Force a page refresh to reset all application state
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="voter-dashboard-container">
        <VoterHeader />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading available elections...</p>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="voter-dashboard-list">
          {filteredElections.length === 0 ? (
            <div className="no-elections">
              <p>No active elections available for you to vote in.</p>
            </div>
          ) : (
            filteredElections.map(election => (
              <div key={election._id} className="election-card">
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
                    onClick={() => navigate(`/voter-election/${election._id}`)}
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
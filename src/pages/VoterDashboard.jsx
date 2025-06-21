import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import VoterHeader from '../components/VoterHeader';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const [allElections, setAllElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { currentUser, loading: authLoading, authError } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingHistory, setVotingHistory] = useState([]);

  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      const electionsResponse = await api.get('/elections/available');
      setAllElections(electionsResponse.data.elections || []);
      setError('');
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError(err.response?.data?.message || 'Failed to load available elections');
      setAllElections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser) {
      fetchElections();

      const socket = io('http://localhost:5001', {
        transports: ['websocket'],
      });

      socket.on('electionListUpdated', () => {
        console.log('Received electionListUpdated on voter dashboard, refetching.');
        fetchElections();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [navigate, currentUser, authLoading, fetchElections]);

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

  if (loading || authLoading) {
    return (
      <div className="voter-dashboard-container">
        <VoterHeader />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || authError) {
    return (
      <div className="voter-dashboard-container">
        <VoterHeader />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error || authError}</p>
          <button onClick={() => navigate('/login')} className="back-button">
            Go to Login
          </button>
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

        <div className="voter-dashboard-list">
          {filteredElections.length === 0 ? (
            <div className="no-elections">
              <p>No active elections available for you to vote in.</p>
            </div>
          ) : (
            filteredElections.map(election => {
              console.log(`Election ${election.title} hasVoted:`, election.hasVoted);
              return (
              <div key={election._id} className="election-card">
                <div className="election-card-header">
                  <h3>{election.title}</h3>
                    <span className={`election-status ${election.status?.toLowerCase()}`}>{election.status}</span>
                </div>
                <div className="election-card-details">
                  <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
                  <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
                  <p><strong>Total Questions:</strong> {election.questions?.length || 0}</p>
                </div>
                <div className="election-card-actions">
                    <Link 
                      to={`/voter-election/${election._id}`}
                    className={`vote-btn ${election.hasVoted ? 'voted' : ''}`}
                  >
                    {election.hasVoted ? 'Voted' : 'Vote Now'}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard; 
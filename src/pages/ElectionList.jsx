import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './ElectionList.css';

const ElectionList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const fetchElections = async () => {
    try {
      const res = await api.get('/api/elections');
      setElections(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
    
    // Set up real-time updates every 30 seconds
    const updateInterval = setInterval(fetchElections, 30000);
    
    return () => clearInterval(updateInterval);
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'status-live';
      case 'scheduled':
        return 'status-scheduled';
      case 'ended':
        return 'status-ended';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-draft';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      case 'ended':
        return 'Ended';
      case 'completed':
        return 'Completed';
      default:
        return 'Draft';
    }
  };

  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    return election.status?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading elections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={fetchElections} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="election-list">
      <div className="election-list-header">
        <div className="header-content">
          <h1>Elections</h1>
          <p className="subtitle">Manage and monitor your elections</p>
        </div>
        <Link to="/dashboard/create-election-wizard" className="create-election-btn">
          <span className="btn-icon">+</span>
          Create New Election
        </Link>
      </div>

      <div className="filter-controls">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Elections
        </button>
        <button
          className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
          onClick={() => setFilter('live')}
        >
          Live
        </button>
        <button
          className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
          onClick={() => setFilter('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="elections-grid">
        {filteredElections.map(election => (
          <div key={election._id} className="election-card">
            <div className="election-header">
              <div className="election-title-section">
                <h2>{election.title}</h2>
                <span className={`status-badge ${getStatusBadgeClass(election.status)}`}>
                  {getStatusLabel(election.status)}
                </span>
              </div>
              {election.hasVoted && (
                <span className="voted-badge">
                  <span className="voted-icon">✓</span>
                  Voted
                </span>
              )}
            </div>

            <p className="election-description">{election.description}</p>

            <div className="election-stats">
              <div className="stat-item">
                <span className="stat-label">Voters</span>
                <span className="stat-value">{election.totalVoters || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Votes Cast</span>
                <span className="stat-value">{election.totalVotes || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Participation</span>
                <span className="stat-value">
                  {election.totalVoters ? 
                    ((election.totalVotes / election.totalVoters) * 100).toFixed(1) + '%' : 
                    '0%'}
                </span>
              </div>
            </div>

            <div className="election-timeline">
              <div className="timeline-item">
                <span className="timeline-label">Start</span>
                <span className="timeline-value">
                  {new Date(election.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="timeline-item">
                <span className="timeline-label">End</span>
                <span className="timeline-value">
                  {new Date(election.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Mini Results Section */}
            <div className="election-mini-results">
              <h4 className="mini-results-title">Current Results</h4>
              {election.questions?.length > 0 ? (
                election.questions.map(question => (
                  <div key={question._id} className="mini-question-results">
                    <p className="mini-question-text">{question.text}</p>
                    <div className="mini-options-list">
                      {question.options.map(option => {
                        const voteCount = option.voteCount || 0;
                        const totalVotesForQuestion = question.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
                        const percentage = totalVotesForQuestion > 0 ? (voteCount / totalVotesForQuestion) * 100 : 0;
                        const isWinning = Math.max(...question.options.map(opt => opt.voteCount || 0)) === voteCount && voteCount > 0;
                        return (
                          <div key={option._id} className={`mini-option-item ${isWinning ? 'winning' : ''}`}>
                            <span className="mini-option-text">{option.text}</span>
                            <span className="mini-option-votes">{voteCount} ({percentage.toFixed(1)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-results-message">No questions available for results.</p>
              )}
              <div className="mini-results-summary">
                <p><strong>Total Ballots:</strong> {election.totalVotes || 0}</p>
                <p><strong>Participation:</strong> {election.voterParticipation?.percentage?.toFixed(1) || 0}%</p>
              </div>
            </div>

            <div className="election-actions">
              <Link 
                to={`/dashboard/elections/${election._id}/overview`} 
                className="view-btn"
              >
                View Details
              </Link>
              {election.status?.toLowerCase() === 'live' && (
                <Link 
                  to={`/dashboard/elections/${election._id}/vote`} 
                  className="vote-btn"
                >
                  Vote Now
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredElections.length === 0 && (
        <div className="no-elections">
          <div className="no-elections-icon">📋</div>
          <h3>No Elections Found</h3>
          <p>There are no elections matching your current filter.</p>
          {filter !== 'all' && (
            <button 
              className="clear-filter-btn"
              onClick={() => setFilter('all')}
            >
              Show All Elections
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ElectionList; 
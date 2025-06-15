import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionOverview.css';

const colorCards = [
  { label: 'Voters', color: '#ff7a00', icon: '👥', key: 'voters' },
  { label: 'Ballot Questions', color: '#f5007b', icon: '❓', key: 'questions' },
  { label: 'Votes Cast', color: '#4b23c5', icon: '🗳️', key: 'votes' },
];

const ElectionOverview = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchElection = async () => {
    try {
      const response = await api.get(`/elections/${id}`);
      if (response.data) {
        console.log('Election data received:', response.data);
        setElection(response.data);
        setError('');
      } else {
        setElection(null);
        setError('Election not found');
      }
    } catch (err) {
      console.error('Error fetching election:', err);
      setElection(null);
      setError(err.response?.data?.message || 'Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(fetchElection, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading election details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={() => window.history.back()} className="back-button">
          Go Back
        </button>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="not-found-container">
        <div className="not-found-icon">🔍</div>
        <p className="not-found-message">Election not found</p>
        <button onClick={() => window.history.back()} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  // Calculate unique voters who have cast votes
  const uniqueVoters = election.votes ? new Set(election.votes.map(vote => vote.voterEmail)).size : 0;
  const totalVoters = election.voters ? election.voters.length : 0;
  const voterParticipation = totalVoters > 0 ? (uniqueVoters / totalVoters) * 100 : 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return '#2ecc71';
      case 'scheduled':
        return '#f1c40f';
      case 'ended':
        return '#e74c3c';
      case 'draft':
        return '#3498db';
      case 'completed':
        return '#27ae60';
      default:
        return '#95a5a6';
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
      case 'draft':
        return 'Draft';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main election-content-animated">
        <div className="sidebar-header-row">
          <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
            &#9776;
          </button>
          <h2 className="overview-title">{election.title || 'Election'} - Overview</h2>
          <div className="election-status" style={{ background: getStatusColor(election.status), color: 'white', padding: '5px 10px', borderRadius: '4px', marginLeft: '10px', fontWeight: 'bold', display: 'inline-block' }}>
            {election.status ? getStatusLabel(election.status) : 'Draft'}
          </div>
        </div>
        <div className="overview-content">
          <div className="overview-main">
            <div className="overview-row">
              <div className="overview-card">
                <div className="overview-card-label">Status</div>
                <div className="overview-card-value" style={{ color: getStatusColor(election.status), fontWeight: 'bold' }}>
                  {election.status ? getStatusLabel(election.status) : 'Draft'}
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-label">Start Date</div>
                <div className="overview-card-value">{election.startDate ? new Date(election.startDate).toLocaleString() : ''}</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-label">End Date</div>
                <div className="overview-card-value">{election.endDate ? new Date(election.endDate).toLocaleString() : ''}</div>
              </div>
            </div>
            <div className="overview-row">
              <div className="overview-card">
                <div className="overview-card-label">Voter Participation</div>
                <div className="overview-card-value">
                  <div className="participation-bar">
                    <div 
                      className="participation-progress" 
                      style={{ width: `${election.voterParticipation.percentage}%` }}
                    />
                  </div>
                  <div className="participation-text">
                    {election.voterParticipation.votedVoters} of {election.voterParticipation.totalVoters} voters ({election.voterParticipation.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="results-section">
              <h3 className="section-title">Voting Results</h3>
              {election.questions?.map((question) => (
                <div key={question._id} className="question-results">
                  <h4 className="question-title">{question.text}</h4>
                  <div className="options-results">
                    {question.options.map((option) => {
                      const voteCount = option.voteCount || 0;
                      const totalVotes = question.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      const isWinning = Math.max(...question.options.map(opt => opt.voteCount || 0)) === voteCount && voteCount > 0;

                      return (
                        <div key={option._id} className={`option-result ${isWinning ? 'winning' : ''}`}>
                          <div className="option-header">
                            <span className="option-text">{option.text}</span>
                            <span className="vote-count">{voteCount} votes</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="percentage">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Voter Details Section */}
            <div className="voter-details-section">
              <h3 className="section-title">Voter Details</h3>
              <div className="voter-list">
                {election.voterDetails?.map((voter) => (
                  <div key={voter._id} className="voter-card">
                    <div className="voter-info">
                      <span className="voter-name">{voter.name || 'Anonymous'}</span>
                      <span className="voter-email">{voter.email}</span>
                      <span className={`voter-status ${voter.hasVoted ? 'voted' : 'not-voted'}`}>
                        {voter.hasVoted ? 'Voted' : 'Not Voted'}
                      </span>
                    </div>
                    {voter.hasVoted && (
                      <div className="voter-choices">
                        <div className="vote-time">
                          Voted on: {new Date(voter.votedAt).toLocaleString()}
                        </div>
                        {voter.choices.map((choice, index) => (
                          <div key={index} className="vote-choice">
                            <span className="question-label">{choice.questionText}:</span>
                            <span className="option-selected">{choice.optionText}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="overview-side">
            {colorCards.map(card => (
              <div
                key={card.label}
                className="overview-summary-card"
                style={{ background: card.color }}
              >
                <span className="overview-summary-icon">{card.icon}</span>
                <span className="overview-summary-count">
                  {card.key === 'voters' && totalVoters}
                  {card.key === 'questions' && (election.questions ? election.questions.length : 0)}
                  {card.key === 'votes' && (election.votes ? election.votes.length : 0)}
                </span>
                <span className="overview-summary-label">{card.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionOverview; 
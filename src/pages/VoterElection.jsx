import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './VoterElection.css';
import axios from 'axios';

const VoterElection = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  // State management
  const [election, setElection] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isElectionEnded, setIsElectionEnded] = useState(false);
  const [isElectionLive, setIsElectionLive] = useState(false);

  // Define API_URL for Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Fetch election data and check vote status
  const fetchElectionData = useCallback(async () => {
    if (!electionId || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch election data and vote status in parallel
      const [electionRes] = await Promise.all([
        api.get(`/elections/${electionId}`),
      ]);
      
      const electionData = electionRes.data;
      console.log('Election data received:', electionData); // Debug log
      
      if (!electionData.questions || electionData.questions.length === 0) {
        setError('This election has no questions available.');
        setLoading(false);
        return;
      }
      
      setElection(electionData);
      
      // Check election status
      const now = new Date();
      const startDate = new Date(electionData.startDate);
      const endDate = new Date(electionData.endDate);
      
      const isLive = electionData.status?.toLowerCase() === 'live' && 
                   now >= startDate && 
                   now <= endDate;
      
      setIsElectionLive(isLive);
      setIsElectionEnded(electionData.status === 'completed' || electionData.status === 'ended' || now > endDate);
      
      // Set vote status from the fetched election data
      setHasVoted(electionData.hasVoted || false);
      
      // Initialize selected options
      const initialOptions = {};
      electionData.questions?.forEach((q) => {
        initialOptions[q._id] = null;
      });
      setSelectedOptions(initialOptions);
      
    } catch (err) {
      console.error('Error loading election:', err);
      setError('Failed to load election data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [electionId, currentUser]);
  
  // Initial data load
  useEffect(() => {
    fetchElectionData();
  }, [fetchElectionData]);
  
  // Handle option selection
  const handleOptionSelect = (questionId, optionId) => {
    if (hasVoted || !isElectionLive) return;
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  // Handle vote submission
  const handleVote = async (e) => {
    e.preventDefault();
      setLoading(true);
      setError(null);
    setSuccess(null);

    try {
      // Validate that all questions have been answered
      const unansweredQuestions = election.questions.filter(
        question => !selectedOptions[question._id]
      );

      if (unansweredQuestions.length > 0) {
        setError('Please answer all questions before submitting your vote.');
        setLoading(false);
        return;
      }
      
      // Format votes for submission
      const votes = Object.entries(selectedOptions).map(([questionId, optionId]) => ({
        question: questionId,
        option: optionId
      }));
      
      console.log('Submitting votes:', votes);

      const response = await axios.post(
        `${API_URL}/votes`,
        {
          election: electionId,
          votes: votes
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Your vote has been recorded successfully!');
        // Clear selected options after successful vote
        setSelectedOptions({});
        setHasVoted(true);
        // Optionally re-fetch election data to display updated results immediately
        fetchElectionData();
      } else {
        setError(response.data.message || 'Failed to submit vote. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(
        err.response?.data?.message || 
        'An error occurred while submitting your vote. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle clear all selections
  const handleClearAll = () => {
    const clearedOptions = {};
    Object.keys(selectedOptions).forEach(key => {
      clearedOptions[key] = null;
    });
    setSelectedOptions(clearedOptions);
  };

  // Loading state
  if (loading) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading election data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="error-container">
          <h2>Error Loading Election</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // No election data
  if (!election) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="not-found">
          <h2>Election Not Found</h2>
          <p>The requested election could not be found.</p>
          <button 
            onClick={() => navigate('/voter-dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Render results if voted or election ended
  if (hasVoted || isElectionEnded) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="election-results">
          <h2>Election Results: {election.title}</h2>
          <p className="election-description">{election.description}</p>
          
          <div className="election-meta">
            <p><strong>Status:</strong> {isElectionEnded ? 'Ended' : 'Live'}</p>
            <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
            <p><strong>Total Voters:</strong> {election.voters?.length || 0}</p>
            <p><strong>Total Votes Cast:</strong> {election.votes?.length || 0}</p>
          </div>
          
          {election.questions?.map((question, qIndex) => {
            const totalVotes = question.options?.reduce((sum, opt) => sum + (opt.voteCount || 0), 0) || 0;
            
            return (
              <div key={qIndex} className="question-results">
                <h3>Question {qIndex + 1}: {question.text}</h3>
                <div className="results-chart">
                  {question.options?.map((option, oIndex) => {
                    const voteCount = option.voteCount || 0;
                    const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                    const isWinning = Math.max(...question.options.map(o => o.voteCount || 0)) === voteCount && voteCount > 0;
                    
                    return (
                      <div key={oIndex} className="result-bar-container">
                        <div className="result-label">
                          <span className={isWinning ? 'winner' : ''}>
                            {option.text} {isWinning && '🏆'}
                          </span>
                          <span>{percentage}% ({voteCount} {voteCount === 1 ? 'vote' : 'votes'})</span>
                        </div>
                        <div className="result-bar-bg">
                          <div 
                            className={`result-bar-fill ${isWinning ? 'winning' : ''}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="result-summary">
                  <p>Total votes for this question: <strong>{totalVotes}</strong></p>
                </div>
              </div>
            );
          })}
          
          <div className="action-buttons">
            <button 
              onClick={() => window.print()}
              className="btn btn-secondary"
            >
              Print Results
            </button>
            <button 
              onClick={() => navigate('/voter-dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render voting form
  return (
    <div className="voter-election-container">
      <VoterHeader />
      <div className="voting-container">
        <div className="voting-header">
          <h1>{election.title}</h1>
          <p className="election-description">{election.description}</p>
          <div className="election-meta">
            <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleString()}</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="voting-instructions">
          <h2>Voting Instructions</h2>
          <ul>
            <li>Please review each question carefully before making your selection.</li>
            <li>Select one option for each question.</li>
            <li>Your vote is confidential and secure.</li>
            <li>You can review your selections before submitting.</li>
            <li>Voting ends on: {new Date(election.endDate).toLocaleString()}</li>
          </ul>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVote(e); }} className="voting-form">
          {election.questions?.map((question, qIndex) => (
            <div key={question._id} className="question-container">
              <h3>Question {qIndex + 1}: {question.text}</h3>
              <div className="options-container">
                {question.options?.map((option) => (
                  <div 
                    key={option._id}
                    className={`option ${selectedOptions[question._id] === option._id ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(question._id, option._id)}
                  >
                    <div className="option-radio">
                      <div className={`radio-inner ${selectedOptions[question._id] === option._id ? 'selected' : ''}`} />
                    </div>
                    <span className="option-text">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="voting-actions">
            <button 
              type="button"
              onClick={handleClearAll}
              className="btn btn-secondary"
              disabled={loading || hasVoted || !isElectionLive}
            >
              Clear All
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading || hasVoted || !isElectionLive || Object.values(selectedOptions).every(v => v === null)}
            >
              {loading ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </form>
          
          {!isElectionLive && (
            <div className="election-status-message">
            {isElectionEnded ? (
              <p>This election has ended. You can view the results above.</p>
            ) : (
              <p>This election has not started yet. Please check back later.</p>
            )}
            </div>
          )}
      </div>
    </div>
  );
};

export default VoterElection;

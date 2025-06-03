import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './VoterElection.css';

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

  // Fetch election data and check vote status
  const fetchElectionData = useCallback(async () => {
    if (!electionId || !currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch election data and vote status in parallel
      const [electionRes, voteCheckRes] = await Promise.all([
        api.get(`/elections/${electionId}`),
        api.get(`/votes/check/${electionId}`).catch(() => ({
          data: { success: false, hasVoted: false }
        }))
      ]);
      
      const electionData = electionRes.data;
      setElection(electionData);
      
      // Check election status
      const now = new Date();
      const startDate = new Date(electionData.startDate);
      const endDate = new Date(electionData.endDate);
      
      const isLive = electionData.status?.toLowerCase() === 'live' && 
                   now >= startDate && 
                   now <= endDate;
      
      setIsElectionLive(isLive);
      setIsElectionEnded(now > endDate);
      
      // Set vote status
      setHasVoted(voteCheckRes.data?.hasVoted || false);
      
      // Initialize selected options
      const initialOptions = {};
      electionData.questions?.forEach((_, index) => {
        initialOptions[index] = null;
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
  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (hasVoted || !isElectionLive) return;
    
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };
  
  // Handle vote submission
  const handleVote = async () => {
    if (!currentUser || !election) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate that at least one option is selected
      const hasAtLeastOneVote = Object.values(selectedOptions).some(v => v !== null);
      if (!hasAtLeastOneVote) {
        setError('Please select at least one option before submitting your vote.');
        setLoading(false);
        return;
      }
      
      // Prepare vote data
      const votes = [];
      Object.entries(selectedOptions).forEach(([qIndex, oIndex]) => {
        if (oIndex !== null) {
          votes.push({
            question: election.questions[qIndex]._id,
            option: election.questions[qIndex].options[oIndex]._id
          });
        }
      });
      
      // Submit votes
      const response = await api.post('/votes/submit', { 
        electionId: election._id,
        votes 
      });
      
      if (response.data.success) {
        setSuccess('Your vote has been recorded successfully!');
        setHasVoted(true);
        
        // Update local storage
        const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
        if (!votedElections.includes(election._id)) {
          votedElections.push(election._id);
          localStorage.setItem('votedElections', JSON.stringify(votedElections));
        }
        
        // Update the UI with the latest data
        const [electionRes] = await Promise.all([
          api.get(`/elections/${electionId}/results`)
        ]);
        
        setElection(electionRes.data);
        
        // Show success message for a moment before redirecting
        setTimeout(() => {
          navigate(`/voter-election-results/${election._id}`, { 
            state: { 
              message: 'Your vote has been recorded successfully!',
              type: 'success',
              justVoted: true
            },
            replace: true
          });
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.response?.data?.message || 'Failed to submit vote. Please try again.');
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
            const totalVotes = question.options?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0;
            
            return (
              <div key={qIndex} className="question-results">
                <h3>Question {qIndex + 1}: {question.text}</h3>
                <div className="results-chart">
                  {question.options?.map((option, oIndex) => {
                    const voteCount = option.votes?.length || 0;
                    const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                    const isWinning = Math.max(...question.options.map(o => o.votes?.length || 0)) === voteCount;
                    
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
          <p className="election-meta">
            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
          </p>
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

        <div className="voting-form">
          {election.questions?.map((question, qIndex) => (
            <div key={qIndex} className="question-container">
              <h3>Question {qIndex + 1}: {question.text}</h3>
              <div className="options-container">
                {question.options.map((option, oIndex) => (
                  <div 
                    key={oIndex}
                    className={`option ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(qIndex, oIndex)}
                  >
                    <div className="option-radio">
                      <div className={`radio-inner ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`} />
                    </div>
                    <span className="option-text">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="voting-actions">
            <button 
              className="btn btn-primary submit-vote"
              onClick={handleVote}
              disabled={Object.values(selectedOptions).some(v => v === null) || !isElectionLive}
            >
              {isElectionLive ? 'Submit Vote' : 'Voting Not Available'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleClearAll}
            >
              Clear Selections
            </button>
          </div>
          
          {!isElectionLive && (
            <div className="election-status-message">
              {isElectionEnded 
                ? 'This election has ended. Voting is no longer available.'
                : 'This election has not started yet. Please check back later.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterElection;

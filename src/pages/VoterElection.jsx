import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import './ElectionVoters';

const VoterElection = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [isElectionEnded, setIsElectionEnded] = useState(false);
  const [isElectionLive, setIsElectionLive] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(electionId));
      if (found) {
        // Check election status
        const now = new Date();
        const startDate = new Date(found.startDate);
        const endDate = new Date(found.endDate);
        
        const isLive = now >= startDate && now <= endDate;
        const ended = now > endDate;
        const upcoming = now < startDate;
        
        // Update election status
        let status = found.status;
        if (ended && found.status === 'Live') {
          status = 'Ended';
        } else if (isLive && found.status === 'Upcoming') {
          status = 'Live';
        }
        
        if (status !== found.status) {
          const elections = JSON.parse(stored);
          const updatedElections = elections.map(e => 
            String(e.id) === String(electionId) ? { ...e, status } : e
          );
          localStorage.setItem('elections', JSON.stringify(updatedElections));
          found.status = status;
        }
        
        setElection(found);
        setIsElectionEnded(ended);
        setIsElectionLive(isLive);
        
        // Initialize selected options
        const initialOptions = {};
        found.questions?.forEach((_, index) => {
          initialOptions[index] = null;
        });
        setSelectedOptions(initialOptions);

        // Check if current user has voted
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && found.votes) {
          const userVotes = found.votes.filter(vote => vote.voterEmail === currentUser.email);
          setHasVoted(userVotes.length > 0);
        }
      } else {
        setError('Election not found');
      }
    }
    setLoading(false);
  }, [electionId]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (isElectionEnded || hasVoted || !isElectionLive) return;
    
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleVote = () => {
    if (isElectionEnded || hasVoted) return;

    if (!isElectionLive) {
      setError('This election is not yet open for voting');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      setError('You must be logged in to vote');
      return;
    }

    // Check if all questions have been answered
    const allQuestionsAnswered = election.questions.every((_, index) => 
      selectedOptions[index] !== null
    );

    if (!allQuestionsAnswered) {
      setError('Please answer all questions before submitting your vote');
      return;
    }

    // Create vote objects
    const votes = Object.entries(selectedOptions).map(([questionIndex, optionIndex]) => ({
      questionIndex: parseInt(questionIndex),
      optionIndex: parseInt(optionIndex),
      voterEmail: currentUser.email,
      timestamp: new Date().toISOString()
    }));

    // Update election with new votes
    const stored = localStorage.getItem('elections');
    if (stored) {
      const elections = JSON.parse(stored);
      const updatedElections = elections.map(e => {
        if (String(e.id) === String(electionId)) {
          return {
            ...e,
            votes: [...(e.votes || []), ...votes]
          };
        }
        return e;
      });
      localStorage.setItem('elections', JSON.stringify(updatedElections));
      
      // Update voting history
      const votingHistory = JSON.parse(localStorage.getItem('votingHistory') || '[]');
      const newVote = {
        electionId: election.id,
        voterEmail: currentUser.email,
        selectedOptions: votes,
        timestamp: new Date().toISOString()
      };
      votingHistory.push(newVote);
      localStorage.setItem('votingHistory', JSON.stringify(votingHistory));

      setElection(prev => ({
        ...prev,
        votes: [...(prev.votes || []), ...votes]
      }));
      setHasVoted(true);
      setSuccess('Your vote has been recorded successfully!');
      setTimeout(() => {
        navigate('/voter-dashboard');
      }, 2000);
    }
  };

  const handleClearAll = () => {
    if (isElectionEnded || hasVoted || !isElectionLive) return;
    
    const clearedOptions = {};
    election.questions?.forEach((_, index) => {
      clearedOptions[index] = null;
    });
    setSelectedOptions(clearedOptions);
  };

  if (loading) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="loading">Loading election...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="voter-election-container">
        <VoterHeader />
        <div className="error">Election not found</div>
      </div>
    );
  }

  return (
    <div className="voter-election-container">
      <VoterHeader />
      <div className="preview-container">
        <div className="preview-header">
          <h1 className="preview-title">{election.title}</h1>
          <div className="preview-info">
            <p className="preview-date">
              Election Period: {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
            </p>
            <p className="preview-timezone">Timezone: {election.timezone}</p>
            <p className="preview-status">Status: {election.status}</p>
          </div>
        </div>

        {isElectionEnded ? (
          <div className="election-ended-message">
            <h2>Election has ended</h2>
            <p>The voting period for this election has concluded. You can view the results below.</p>
          </div>
        ) : !isElectionLive ? (
          <div className="election-upcoming-message">
            <h2>Election has not started yet</h2>
            <p>This election will begin on {new Date(election.startDate).toLocaleString()}</p>
          </div>
        ) : hasVoted ? (
          <div className="voted-message">
            <h2>Thank you for voting!</h2>
            <p>You have already cast your vote in this election. You can view the results below.</p>
          </div>
        ) : (
          <>
            <div className="preview-instructions">
              <h2>Instructions</h2>
              <ul>
                <li>Please review each question carefully before making your selection.</li>
                <li>You can only select one option per question.</li>
                <li>Your vote is confidential and secure.</li>
                <li>You can review your selections before submitting.</li>
                <li>Voting ends at: {new Date(election.endDate).toLocaleString()}</li>
              </ul>
            </div>

            <div className="preview-ballot">
              {election.questions?.map((question, qIndex) => (
                <div key={qIndex} className="preview-question">
                  <h3 className="question-number">Question {qIndex + 1}</h3>
                  <p className="question-text">{question.text}</p>
                  <div className="options-container">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`option-item ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(qIndex, oIndex)}
                      >
                        <div className="option-radio">
                          <div className={`radio-inner ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`} />
                        </div>
                        <span className="option-text">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-actions">
              <button 
                className="preview-submit-btn" 
                disabled={Object.values(selectedOptions).some(v => v === null)}
                onClick={handleVote}
              >
                Submit Ballot
              </button>
              <button 
                className="preview-clear-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </>
        )}

        {/* Results Section */}
        <div className="results-section">
          <h2>Results</h2>
          {election.questions?.map((question, qIndex) => {
            const questionVotes = election.votes?.filter(v => v.questionIndex === qIndex) || [];
            const totalVotes = questionVotes.length;
            
            return (
              <div key={qIndex} className="question-results">
                <h3>Question {qIndex + 1}: {question.text}</h3>
                <div className="options-results">
                  {question.options.map((option, oIndex) => {
                    const votes = questionVotes.filter(v => v.optionIndex === oIndex).length;
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                    return (
                      <div key={oIndex} className="option-result">
                        <div className="option-header">
                          <span className="option-text">{option}</span>
                          <span className="vote-count">
                            {votes} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoterElection; 
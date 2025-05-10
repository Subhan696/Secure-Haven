import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
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

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      if (found) {
        // Update election status based on dates and launched status
        const now = new Date();
        const startDate = new Date(found.startDate);
        const endDate = new Date(found.endDate);
        
        let status = found.status;
        
        // Only update status if the election has been launched
        if (found.launched) {
          if (now > endDate) {
            // If end date has passed, mark as Ended
            status = 'Ended';
          } else if (now >= startDate && now <= endDate) {
            // If current time is between start and end dates, mark as Live
            status = 'Live';
          } else if (now < startDate) {
            // If start date is in the future, mark as Upcoming
            status = 'Upcoming';
          }
        } else {
          // If not launched yet, check if it should be deleted
          if (now > endDate) {
            // If end date has passed and election wasn't launched, it should be deleted
            const elections = JSON.parse(stored);
            const filteredElections = elections.filter(e => String(e.id) !== String(id));
            localStorage.setItem('elections', JSON.stringify(filteredElections));
            // Set election to null and return early
            setElection(null);
            return;
          } else {
            // If not launched and end date hasn't passed, keep as Draft
            status = 'Draft';
          }
        }
        
        // Update status in localStorage if it changed
        if (status !== found.status) {
          const elections = JSON.parse(stored);
          const updatedElections = elections.map(e => 
            String(e.id) === String(id) ? { ...e, status } : e
          );
          localStorage.setItem('elections', JSON.stringify(updatedElections));
          found.status = status;
        }
        
        setElection(found);
      }
    }
  }, [id]);

  if (!election) return <div className="loading">Election not found</div>;

  // Calculate unique voters who have cast votes
  const uniqueVoters = election.votes ? new Set(election.votes.map(vote => vote.voterEmail)).size : 0;
  const totalVoters = election.voters ? election.voters.length : 0;
  const voterParticipation = totalVoters > 0 ? (uniqueVoters / totalVoters) * 100 : 0;

  // Get voter details with their votes
  const voterDetails = election.voters?.map(voter => {
    const voterVotes = election.votes?.filter(vote => vote.voterEmail === voter.email) || [];
    return {
      ...voter,
      votes: voterVotes
    };
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live':
        return '#2ecc71';
      case 'Upcoming':
        return '#f1c40f';
      case 'Ended':
        return '#e74c3c';
      case 'Building':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="overview-title">{election.title || 'Election'} - Overview</h2>
        <div className="overview-content">
          <div className="overview-main">
            <div className="overview-row">
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
                <div className="overview-card-label">Status</div>
                <div className="overview-card-value" style={{ color: getStatusColor(election.status) }}>
                  {election.status}
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-label">Voter Participation</div>
                <div className="overview-card-value">
                  <div className="participation-bar">
                    <div 
                      className="participation-progress" 
                      style={{ width: `${voterParticipation}%` }}
                    />
                  </div>
                  <div className="participation-text">
                    {uniqueVoters} of {totalVoters} voters ({voterParticipation.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="results-section">
              <h3 className="section-title">Voting Results</h3>
              {election.questions?.map((question, qIndex) => {
                const questionVotes = election.votes?.filter(v => v.questionIndex === qIndex) || [];
                const totalVotes = questionVotes.length;
                
                return (
                  <div key={qIndex} className="question-results">
                    <h4 className="question-title">{question.text}</h4>
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

            {/* Voter Details Section */}
            <div className="voter-details-section">
              <h3 className="section-title">Voter Details</h3>
              <div className="voter-list">
                {voterDetails.map((voter, index) => (
                  <div key={index} className="voter-card">
                    <div className="voter-info">
                      <span className="voter-name">{voter.name}</span>
                      <span className="voter-email">{voter.email}</span>
                    </div>
                    <div className="voter-votes">
                      {voter.votes.length > 0 ? (
                        voter.votes.map((vote, vIndex) => {
                          const question = election.questions[vote.questionIndex];
                          const option = question?.options[vote.optionIndex];
                          return (
                            <div key={vIndex} className="vote-detail">
                              <span className="question-label">Q{vote.questionIndex + 1}:</span>
                              <span className="option-selected">{option}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="not-voted">Has not voted yet</span>
                      )}
                    </div>
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
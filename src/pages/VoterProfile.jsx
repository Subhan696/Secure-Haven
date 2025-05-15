import React, { useState, useEffect } from 'react';
import VoterHeader from '../components/VoterHeader';
import './VoterProfile.css';

const VoterProfile = () => {
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    // Get voting history from localStorage
    const votingHistory = JSON.parse(localStorage.getItem('votingHistory') || '[]');
    const userVotingHistory = votingHistory.filter(vote => 
      vote.voterEmail === currentUser.email && 
      vote.selectedOptions && 
      vote.selectedOptions.length > 0
    );
    
    // Get elections data
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    
    // Dynamically compute results for each election
    const votedElections = userVotingHistory.map(vote => {
      const election = elections.find(e => e.id === vote.electionId);
      if (!election) return null;
      // Get all votes for this election
      const allVotes = votingHistory.filter(v => v.electionId === vote.electionId);
      // For each question, count votes per option
      const questionsWithResults = election.questions.map((q, qIdx) => {
        const optionCounts = Array(q.options.length).fill(0);
        allVotes.forEach(v => {
          (v.selectedOptions || []).forEach(sel => {
            if (sel.questionIndex === qIdx && sel.optionIndex >= 0 && sel.optionIndex < q.options.length) {
              optionCounts[sel.optionIndex] += 1;
            }
          });
        });
        return {
          ...q,
          dynamicResults: optionCounts
        };
      });
      return {
        ...election,
        date: vote.timestamp,
        questions: questionsWithResults
      };
    }).filter(Boolean); // Remove any null entries

    setVotedElections(votedElections);
    setLoading(false);
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
        <div className="elections-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : votedElections.length === 0 ? (
            <div className="no-elections">
              <p>You haven't participated in any elections yet.</p>
            </div>
          ) : (
            votedElections.map((election) => (
              <div key={election.id} className="election-card">
                <div className="election-info">
                  <h3>{election.title}</h3>
                  <p className="election-date">
                    Voted on: {new Date(election.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="election-status">
                  <span className={`status-badge ${election.status?.toLowerCase()}`}>{election.status}</span>
                </div>
                <div className="election-results">
                  {election.questions && election.questions.length > 0 ? (
                    election.questions.map((q, idx) => (
                      <div key={idx} className="result-question">
                        <h4>{q.text}</h4>
                        <ul>
                          {q.options.map((opt, oidx) => (
                            <li key={oidx}>
                              {opt}: {q.dynamicResults ? q.dynamicResults[oidx] || 0 : 0} votes
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div>No questions found for this election.</div>
                  )}
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
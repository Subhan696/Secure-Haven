import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';

const VoterElectionResults = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const found = elections.find(e => e.id === electionId);
    setElection(found);
    setLoading(false);
  }, [electionId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!election) {
    return <div className="no-elections">Election not found.</div>;
  }

  return (
    <div>
      <VoterHeader />
      <div className="voter-profile-container">
        <div className="profile-header">
          <h1>Results for: {election.title}</h1>
        </div>
        <div className="election-results">
          {election.questions && election.questions.length > 0 ? (
            election.questions.map((q, idx) => (
              <div key={idx} className="result-question">
                <h3>{q.text}</h3>
                <ul>
                  {q.options.map((opt, oidx) => (
                    <li key={oidx}>
                      {opt}: {q.results ? q.results[oidx] || 0 : 0} votes
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div>No questions found for this election.</div>
          )}
        </div>
        <button onClick={() => navigate(-1)} style={{marginTop: '2rem'}}>Back</button>
      </div>
    </div>
  );
};

export default VoterElectionResults;

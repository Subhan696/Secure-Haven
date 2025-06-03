import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import api from '../utils/api';

const VoterElectionResults = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${electionId}`);
        
        if (response.data) {
          setElection(response.data);
          setError(null);
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

    fetchElection();
  }, [electionId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading election results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
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
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
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

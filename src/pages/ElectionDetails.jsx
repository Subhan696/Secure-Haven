import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ElectionDetails.css';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockElection = {
      id: parseInt(id),
      title: 'Student Council Election 2024',
      description: 'Annual election for student council members. Vote for your preferred candidates to represent the student body.',
      startDate: '2024-03-01T00:00:00',
      endDate: '2024-03-07T23:59:59',
      status: 'active',
      totalVoters: 150,
      totalVotes: 120,
      candidates: [
        {
          id: 1,
          name: 'John Doe',
          description: 'Current class representative with 2 years of experience',
          votes: 45
        },
        {
          id: 2,
          name: 'Jane Smith',
          description: 'Active member of student clubs and organizations',
          votes: 35
        },
        {
          id: 3,
          name: 'Mike Johnson',
          description: 'Former sports committee member',
          votes: 40
        }
      ]
    };

    setElection(mockElection);
    setLoading(false);
  }, [id]);

  const handleVote = (candidateId) => {
    setSelectedCandidate(candidateId);
    setShowConfirmModal(true);
  };

  const confirmVote = () => {
    // TODO: Add API call to submit vote
    console.log('Voting for candidate:', selectedCandidate);
    setShowConfirmModal(false);
    // Refresh election data after voting
  };

  if (loading) {
    return <div className="loading">Loading election details...</div>;
  }

  if (!election) {
    return <div className="error">Election not found</div>;
  }

  return (
    <div className="election-details">
      <div className="election-header">
        <div className="header-content">
          <h1>{election.title}</h1>
          <span className={`status-badge ${election.status}`}>
            {election.status}
          </span>
        </div>
        <Link to="/dashboard/elections" className="back-btn">
          Back to Elections
        </Link>
      </div>

      <div className="election-info">
        <div className="info-section">
          <h2>Description</h2>
          <p>{election.description}</p>
        </div>

        <div className="info-section">
          <h2>Election Period</h2>
          <div className="date-info">
            <div className="date-item">
              <span className="label">Start Date:</span>
              <span>{new Date(election.startDate).toLocaleDateString()}</span>
            </div>
            <div className="date-item">
              <span className="label">End Date:</span>
              <span>{new Date(election.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Voting Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{election.totalVoters}</span>
              <span className="stat-label">Total Voters</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{election.totalVotes}</span>
              <span className="stat-label">Total Votes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {((election.totalVotes / election.totalVoters) * 100).toFixed(1)}%
              </span>
              <span className="stat-label">Voter Turnout</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Candidates</h2>
          <div className="candidates-grid">
            {election.candidates.map(candidate => (
              <div key={candidate.id} className="candidate-card">
                <h3>{candidate.name}</h3>
                <p>{candidate.description}</p>
                <div className="candidate-stats">
                  <div className="vote-count">
                    <span className="count">{candidate.votes}</span>
                    <span className="label">votes</span>
                  </div>
                  <div className="vote-percentage">
                    <span className="percentage">
                      {((candidate.votes / election.totalVotes) * 100).toFixed(1)}%
                    </span>
                    <span className="label">of total votes</span>
                  </div>
                </div>
                {election.status === 'active' && (
                  <button
                    className="vote-btn"
                    onClick={() => handleVote(candidate.id)}
                  >
                    Vote
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Your Vote</h3>
            <p>
              Are you sure you want to vote for{' '}
              {election.candidates.find(c => c.id === selectedCandidate)?.name}?
            </p>
            <p className="warning">
              Note: Once you submit your vote, it cannot be changed.
            </p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmVote}>
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionDetails; 
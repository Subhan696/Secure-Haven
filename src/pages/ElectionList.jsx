import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ElectionList.css';

const ElectionList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, upcoming, completed

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockElections = [
      {
        id: 1,
        title: 'Student Council Election 2024',
        description: 'Annual election for student council members',
        startDate: '2024-03-01T00:00:00',
        endDate: '2024-03-07T23:59:59',
        status: 'upcoming',
        totalVoters: 0,
        totalVotes: 0
      },
      {
        id: 2,
        title: 'Class Representative Election',
        description: 'Election for class representatives',
        startDate: '2024-02-15T00:00:00',
        endDate: '2024-02-20T23:59:59',
        status: 'active',
        totalVoters: 150,
        totalVotes: 120
      },
      {
        id: 3,
        title: 'Sports Committee Election',
        description: 'Election for sports committee members',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-07T23:59:59',
        status: 'completed',
        totalVoters: 200,
        totalVotes: 180
      }
    ];

    setElections(mockElections);
    setLoading(false);
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'upcoming':
        return 'status-upcoming';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    return election.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading elections...</div>;
  }

  return (
    <div className="election-list">
      <div className="election-list-header">
        <h1>Elections</h1>
        <Link to="/dashboard/create-election" className="create-election-btn">
          Create New Election
        </Link>
      </div>

      <div className="filter-controls">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="elections-grid">
        {filteredElections.map(election => (
          <div key={election.id} className="election-card">
            <div className="election-header">
              <h2>{election.title}</h2>
              <span className={`status-badge ${getStatusBadgeClass(election.status)}`}>
                {election.status}
              </span>
            </div>
            <p className="election-description">{election.description}</p>
            <div className="election-details">
              <div className="detail-item">
                <span className="label">Start Date:</span>
                <span>{new Date(election.startDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">End Date:</span>
                <span>{new Date(election.endDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Voters:</span>
                <span>{election.totalVoters}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Votes:</span>
                <span>{election.totalVotes}</span>
              </div>
            </div>
            <div className="election-actions">
              <Link to={`/dashboard/elections/${election.id}`} className="view-btn">
                View Details
              </Link>
              {election.status === 'active' && (
                <Link to={`/dashboard/elections/${election.id}/vote`} className="vote-btn">
                  Vote Now
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionList; 
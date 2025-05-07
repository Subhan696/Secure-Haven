import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
    // Read elections from localStorage
    const stored = localStorage.getItem('elections');
    if (stored) {
      setElections(JSON.parse(stored));
    } else {
      setElections([]);
    }
  }, []);

  // Filter logic (static for now)
  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-bg">
      <div className="dashboard-header-row">
        <h1 className="dashboard-title">Dashboard</h1>
        <button className="new-election-btn" onClick={() => navigate('/dashboard/create-election-wizard')}>
          <span className="plus-icon">&#43;</span> New Election
        </button>
      </div>
      <div className="dashboard-controls-row">
        <div className="dashboard-search-group">
          <input
            type="text"
            className="dashboard-search"
            placeholder="Search by election title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="dashboard-search-btn" disabled>
            <span role="img" aria-label="search">🔍</span>
          </button>
        </div>
        <select
          className="dashboard-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
        </select>
      </div>
      <div className="dashboard-list">
        {filteredElections.map(election => (
          <div className="election-card" key={election.id}>
            <div className="election-card-header">
              <h3>{election.title}</h3>
              <div className={`election-status ${election.status === 'live' ? 'live' : 'draft'}`}>
                {election.status === 'live' ? 'Live' : 'Draft'}
              </div>
            </div>
            <div className="election-card-details">
              <p>Start: {new Date(election.startDate).toLocaleDateString()}</p>
              <p>End: {new Date(election.endDate).toLocaleDateString()}</p>
              <p>Questions: {election.questions?.length || 0}</p>
              <p>Voters: {election.voters?.length || 0}</p>
            </div>
            <div className="election-card-actions">
              <Link to={`/dashboard/elections/${election.id}/overview`} className="view-btn">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-count">
        Showing {filteredElections.length} to {filteredElections.length} of {filteredElections.length} Election{filteredElections.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default Dashboard;

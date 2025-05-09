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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }

    setEmail(currentUser.email);
    
    // Read elections from localStorage
    const stored = localStorage.getItem('elections');
    if (stored) {
      // Only show elections created by the current admin
      const userElections = JSON.parse(stored).filter(election => 
        election.createdBy === currentUser.email
      );
      setElections(userElections);
    } else {
      setElections([]);
    }
  }, [navigate]);

  // Filter logic
  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span className="user-email">{email}</span>
          <Link to="/dashboard/create-election-wizard" className="create-election-btn">
            Create New Election
          </Link>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Building">Building</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Live">Live</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="dashboard-list">
        {filteredElections.map(election => (
          <div className="election-card" key={election.id}>
            <div className="election-card-header">
              <h3>{election.title}</h3>
              <div className={`election-status ${election.status.toLowerCase()}`}>
                {election.status}
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

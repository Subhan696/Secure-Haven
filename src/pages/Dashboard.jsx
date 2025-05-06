import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const mockElections = [
  {
    id: 1,
    title: 'TEST',
    status: 'Building',
    startDate: '04/24/25, 3:00 PM',
    endDate: '05/04/25, 2:00 PM',
  },
];

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [elections, setElections] = useState(mockElections);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
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
        <button className="new-election-btn" onClick={() => navigate('/dashboard/create-election')}>
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
          <option value="">Filter by status...</option>
          <option value="Building">Building</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="dashboard-list">
        {filteredElections.map(election => (
          <div className="election-card" key={election.id}>
            <div className="election-title">{election.title}</div>
            <span className="election-badge">{election.status}</span>
            <div className="election-dates">
              <span className="election-date-label">START DATE</span>
              <span className="election-date">{election.startDate}</span>
              <span className="election-date-label">END DATE</span>
              <span className="election-date">{election.endDate}</span>
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

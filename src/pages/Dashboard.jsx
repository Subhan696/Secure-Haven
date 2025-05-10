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
      const now = new Date();
      let allElections = JSON.parse(stored);
      let updatedElections = false;
      
      // Update election statuses based on current date
      allElections = allElections.map(election => {
        const startDate = new Date(election.startDate);
        const endDate = new Date(election.endDate);
        let status = election.status;
        
        // Update status based on dates if the election has been launched
        if (election.launched) {
          if (now > endDate && status !== 'Ended') {
            status = 'Ended';
            updatedElections = true;
          } else if (now >= startDate && now <= endDate && status !== 'Live') {
            status = 'Live';
            updatedElections = true;
          } else if (now < startDate && status !== 'Upcoming') {
            status = 'Upcoming';
            updatedElections = true;
          }
        } else {
          // If not launched and end date has passed, it should be deleted
          // We'll handle this in the filter below
        }
        
        return { ...election, status };
      });
      
      // Filter out elections that weren't launched and have ended
      const validElections = allElections.filter(election => {
        if (!election.launched) {
          const endDate = new Date(election.endDate);
          if (now > endDate) {
            updatedElections = true;
            return false; // Remove this election
          }
        }
        return true;
      });
      
      // Save updated elections back to localStorage if any changes were made
      if (updatedElections) {
        localStorage.setItem('elections', JSON.stringify(validElections));
      }
      
      // Only show elections created by the current admin
      const userElections = validElections.filter(election => 
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

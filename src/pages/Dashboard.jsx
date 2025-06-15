import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allElections, setAllElections] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Set email from current user
    if (currentUser.email) {
      setEmail(currentUser.email);
    }
    
    // Fetch elections from backend API
    const fetchElections = async () => {
      try {
        setLoading(true);
        // The backend API will handle filtering by the current user's created elections
        // and will calculate the status based on dates
        const response = await api.get('/elections');
        
        // The response includes elections and pagination info
        if (response.data && response.data.elections) {
          setAllElections(response.data.elections);
        } else {
          setAllElections([]);
        }
        setError('');
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
        setAllElections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [navigate]);

  // Filter logic
  const filteredElections = allElections.filter(election => {
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
        </div>
      </div>

      <Link to="/dashboard/create-election-wizard" className="create-election-btn">
        Create New Election
      </Link>

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
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {/* Display error message if there is one */}
      {error && <div className="error-message">{error}</div>}

      {/* Show loading indicator */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading elections...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-list">
            {filteredElections.length === 0 ? (
              <div className="no-elections">
                <p>No elections found. Create a new election to get started.</p>
              </div>
            ) : (
              filteredElections.map(election => (
                <div className="election-card" key={election._id}>
                  <div className="election-card-header">
                    <h3>{election.title}</h3>
                    <div className={`election-status ${election.status?.toLowerCase()}`}>
                      {election.status}
                    </div>
                  </div>
                  <div className="election-card-details">
                    <p>Start: {new Date(election.startDate).toLocaleString()}</p>
                    <p>End: {new Date(election.endDate).toLocaleString()}</p>
                    <p>Questions: {election.questions?.length || 0}</p>
                    <p>Voters: {election.voters?.length || 0}</p>
                  </div>
                  <div className="election-card-actions">
                    <Link to={`/dashboard/elections/${election._id}/overview`} className="view-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="dashboard-count">
            Showing {filteredElections.length} of {allElections.length} Election{allElections.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

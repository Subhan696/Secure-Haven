import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoterHeader from '../components/VoterHeader';
import './VoterDashboard.css';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'voter') {
      navigate('/login');
      return;
    }

    const storedElections = JSON.parse(localStorage.getItem('elections')) || [];
    console.log('All stored elections:', storedElections);
    
    const eligibleElections = storedElections.filter(election => {
      console.log('Checking election:', election);
      console.log('Election voters:', election.voters);
      return election.voters && election.voters.some(voter => voter.email === currentUser.email);
    });
    
    console.log('Eligible elections:', eligibleElections);
    setElections(eligibleElections);
    setFilteredElections(eligibleElections);
    setLoading(false);
  }, [navigate]);

  const handleElectionClick = (electionId) => {
    console.log('Clicking election with ID:', electionId);
    navigate(`/voter-election/${String(electionId)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredElections(elections);
      return;
    }

    const filtered = elections.filter(election =>
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredElections(filtered);
  };

  if (loading) {
    return (
      <div className="voter-dashboard-container">
        <VoterHeader />
        <div className="loading">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="voter-dashboard-container">
      <VoterHeader />
      <div className="voter-dashboard">
        <div className="dashboard-header">
          <h1>Your Elections</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
        {filteredElections.length > 0 ? (
          <div className="elections-grid">
            {filteredElections.map((election) => (
              <div
                key={election.id}
                className="election-card"
                onClick={() => handleElectionClick(election.id)}
              >
                <h3>{election.title}</h3>
                <p>{election.description}</p>
                <div className="election-meta">
                  <span className={`status ${election.status}`}>
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </span>
                  <span className="voters-count">
                    {election.voters.length} voters
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-elections">
            <p>No elections assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterDashboard; 
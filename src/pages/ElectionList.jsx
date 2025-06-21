import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../utils/api';
import './ElectionList.css';

const ElectionList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchElections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/elections?page=${page}&limit=10&status=${status}&search=${search}`);
      setElections(response.data.elections);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
      setError('');
    } catch (err) {
      setError('Failed to fetch elections.');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchElections();

    const socket = io('http://localhost:5001', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected for election list.');
    });

    socket.on('electionListUpdated', () => {
      console.log('Received electionListUpdated event, refetching elections...');
      fetchElections();
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected for election list.');
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchElections]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchElections();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'live': return 'status-badge live';
      case 'completed': return 'status-badge completed';
      case 'draft': return 'status-badge draft';
      case 'scheduled': return 'status-badge scheduled';
      case 'ended': return 'status-badge ended';
      default: return 'status-badge';
    }
  };

  return (
    <div className="election-list-container">
      <div className="election-list-header">
        <h1>My Elections</h1>
        <Link to="/create-election" className="btn-create-election">
          + Create Election
        </Link>
      </div>

      <div className="filters-and-search">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select id="status-filter" value={status} onChange={handleStatusChange} className="filter-select">
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading elections...</p>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <>
          <div className="election-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>Voters</th>
                  <th>Participation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.length > 0 ? (
                  elections.map((election) => (
                    <tr key={election._id}>
                      <td>
                        <Link to={`/elections/${election._id}/overview`} className="election-title-link">
                          {election.title}
                        </Link>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(election.status)}>
                          {election.status}
                        </span>
                      </td>
                      <td>
                        {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                      </td>
                      <td>{election.totalRegisteredVoters || 0}</td>
                      <td>
                        {election.voterParticipation ? `${election.voterParticipation.percentage.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td>
                        <Link to={`/elections/${election._id}/overview`} className="action-link">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-elections">No elections found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              &laquo; Previous
            </button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => handlePageCahnge(page + 1)}
              disabled={page >= pagination.pages}
            >
              Next &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionList; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVoterKey } from '../utils/voterKey';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionVoters.css';

const ElectionVoters = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [newVoter, setNewVoter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [editEmail, setEditEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch election data from backend API
  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/elections/${id}`);
      
      if (response.data) {
        setElection(response.data);
        setVoters(response.data.voters || []);
        setError('');
      } else {
        setElection(null);
        setVoters([]);
        setError('Election not found');
      }
    } catch (err) {
      console.error('Error fetching election:', err);
      setElection(null);
      setVoters([]);
      setError(err.response?.data?.message || 'Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
  }, [id]);

  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (!newVoter.trim()) return;

    const email = newVoter.trim().toLowerCase();
    
    // Check if voter already exists
    const voterExists = voters.some(v => {
      if (typeof v === 'object') {
        return v.email === email;
      }
      return v === email;
    });

    if (voterExists) {
      setMessage({ type: 'error', text: 'Voter already exists' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      // Create voter object - let the backend generate the voter key
      const voterObj = {
        name: email.split('@')[0],
        email
      };

      console.log('Adding voter:', voterObj);
      
      // Send to backend
      const response = await api.post(`/elections/${id}/voters`, voterObj);
      
      if (response.data) {
        // Update local state with the new voter
        setVoters(response.data.voters);
        setNewVoter('');
        setMessage({ type: 'success', text: 'Voter added successfully' });
      }
    } catch (err) {
      console.error('Error adding voter:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error adding voter' 
      });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEditVoter = (voter) => {
    setEditingVoter(voter);
    setEditEmail(voter.email);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEmail.trim()) return;

    const newEmail = editEmail.trim().toLowerCase();
    
    // Check if the new email already exists (excluding the current voter)
    const emailExists = voters.some(v => {
      if (typeof v === 'object') {
        return v.email === newEmail && v.email !== editingVoter.email;
      }
      return v === newEmail && v !== editingVoter.email;
    });
    
    if (emailExists) {
      setMessage({
        type: 'error',
        text: 'This email is already registered for another voter.'
      });
      return;
    }

    try {
      // First remove the old voter
      await api.delete(`/elections/${id}/voters/${editingVoter.email}`);
      
      // Generate a consistent voter key for the new email
      const voterKey = getVoterKey(newEmail);
      console.log('Generated voter key for edit:', voterKey, 'for email:', newEmail);
      
      // Create updated voter object
      const updatedVoter = {
        name: newEmail.split('@')[0],
        email: newEmail,
        voterKey: voterKey
      };
      
      console.log('Adding updated voter:', updatedVoter);
      
      // Add the updated voter
      await api.post(`/elections/${id}/voters`, updatedVoter);
      
      // Reset edit state
      setEditingVoter(null);
      setEditEmail('');
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Voter updated successfully!'
      });

      // Refresh election data to ensure UI is updated
      await fetchElection();
    } catch (err) {
      console.error('Error updating voter:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Failed to update voter. Please try again.'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingVoter(null);
    setEditEmail('');
  };

  const handleRemoveVoter = async (email) => {
    try {
      console.log('Removing voter with email:', email);
      
      // Send request to backend API to remove voter
      const response = await api.delete(`/elections/${id}/voters/${email}`);
      
      console.log('Remove voter API response:', response.data);
      
      if (response.data) {
        // Update local state with the updated voters from the response
        const updatedVoters = response.data.voters || [];
        console.log('Updated voters after removal:', updatedVoters);
        
        // Update local state
        setVoters(updatedVoters);
        setMessage({
          type: 'success',
          text: 'Voter removed successfully!'
        });

        // Update the election state to reflect the changes
        setElection(prev => ({
          ...prev,
          voters: updatedVoters
        }));
        
        // Refresh election data to ensure UI is updated
        fetchElection();
      }
    } catch (err) {
      console.error('Error removing voter:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Failed to remove voter. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading election details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={() => window.history.back()} className="back-button">
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
        <button onClick={() => window.history.back()} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <div className="sidebar-header-row">
  <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
    &#9776;
  </button>
  <h2 className="voters-title">Manage Voters</h2>
</div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="voters-content">
          <div className="add-voter-section">
            <h3>Add New Voter</h3>
            <form onSubmit={handleAddVoter}>
              <div className="form-group">
                <input
                  type="email"
                  value={newVoter}
                  onChange={(e) => setNewVoter(e.target.value)}
                  placeholder="Enter voter's email"
                  required
                />
                <button type="submit" className="btn-primary">Add Voter</button>
              </div>
            </form>
          </div>

          <div className="voters-list">
            <h3>Current Voters</h3>
            {voters.length === 0 ? (
              <p className="no-voters">No voters added yet.</p>
            ) : (
              <div className="voters-grid">
                {voters.map((voter, index) => (
                  <div key={index} className="voter-card">
                    {editingVoter && editingVoter.email === voter.email ? (
                      <form onSubmit={handleSaveEdit} className="edit-form">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Enter new email"
                          required
                          className="edit-input"
                        />
                        <div className="edit-actions">
                          <button type="submit" className="save-btn">Save</button>
                          <button type="button" onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="voter-info">
                          <div className="voter-email">{voter.email}</div>
                          <div className="voter-key">
                            <strong>Key:</strong> {voter.voterKey || voter.key || 'N/A'}
                          </div>
                        </div>
                        <div className="voter-actions">
                          <button
                            className="edit-voter"
                            onClick={() => handleEditVoter(voter)}
                          >
                            Edit
                          </button>
                          <button
                            className="remove-voter"
                            onClick={() => handleRemoveVoter(voter.email)}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionVoters; 
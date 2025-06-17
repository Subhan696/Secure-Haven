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
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVoter(null);
    setEditEmail('');
  };

  const handleRemoveVoter = async (email) => {
    try {
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  // New function to set election status to draft
  const handleSetToDraft = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await api.put(`/elections/${id}/status`, { status: 'draft' });
      if (response.data) {
        setElection(prev => ({ ...prev, status: 'draft' }));
        alert('Election status set to Draft. You can now manage voters.');
      }
    } catch (err) {
      console.error('Error setting to draft:', err);
      setError(err.response?.data?.message || 'Failed to set election to draft.');
    } finally {
      setIsSaving(false);
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

  // Check if election is available and in editable status
  const isEditable = election && (election.status === 'draft' || election.status === 'scheduled' || election.status === 'ended');

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <div className="sidebar-header-row">
  <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
    &#9776;
  </button>
          <h2 className="voters-title">Election Voters</h2>
        </div>
        {!isEditable && election && election.status !== 'completed' && election.status !== 'live' && (
          <div className="status-warning">
            <p>
              Voter management is disabled because the election is currently{' '}
              <strong>{election.status}</strong>.
              To make changes, please revert the election to{' '}
              <button onClick={handleSetToDraft} disabled={isSaving}>
                Draft
              </button>
              {' '}status or wait for it to be scheduled/ended.
            </p>
          </div>
        )}

        {election && (election.status === 'completed' || election.status === 'live') ? (
          <div className="voters-closed-msg">
            This election is {election.status}. Voter management is no longer allowed.
          </div>
        ) : (
          <div className="voters-content">
            <form onSubmit={handleAddVoter} className="form-group">
              <h3>Add New Voter</h3>
              <input
                type="email"
                placeholder="Enter voter email"
                value={newVoter}
                onChange={(e) => setNewVoter(e.target.value)}
                disabled={!isEditable || isSaving}
                className="form-group-input"
              />
              <button type="submit" disabled={!isEditable || isSaving} className="btn-primary">Add Voter</button>
            </form>

            <div className="voters-list">
              <h3>Current Voters ({voters.length})</h3>
              {message.text && (
                <div className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
                  {message.text}
                </div>
              )}
              {voters.length === 0 ? (
                <p className="no-voters">No voters added yet.</p>
              ) : (
                <ul className="voters-grid">
                  {voters.map((voter, index) => (
                    <li key={index} className="voter-card">
                      {editingVoter && editingVoter.email === voter.email ? (
                        <form onSubmit={handleSaveEdit} className="edit-form">
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            disabled={!isEditable || isSaving}
                            className="edit-input"
                          />
                          <div className="edit-actions">
                            <button type="submit" disabled={!isEditable || isSaving} className="save-btn">Save</button>
                            <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="cancel-btn">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <span>{typeof voter === 'object' ? `${voter.name} (${voter.email})` : voter}</span>
                          <div className="voter-actions">
                            <button onClick={() => handleEditVoter(voter)} disabled={!isEditable || isSaving} className="edit-voter">Edit</button>
                            <button onClick={() => handleRemoveVoter(voter.email)} disabled={!isEditable || isSaving} className="remove-voter">Remove</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionVoters; 
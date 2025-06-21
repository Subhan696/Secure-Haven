import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionVoters.css';

const ElectionVoters = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [newVoterEmail, setNewVoterEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [editEmail, setEditEmail] = useState('');

  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/elections/${id}`);
      if (response.data) {
        setElection(response.data);
        setVoters(response.data.voters || []);
      } else {
        setError('Election not found');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load election details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
  }, [id]);

  const handleAddVoter = async (e) => {
    e.preventDefault();
    setError('');
    const email = newVoterEmail.trim().toLowerCase();
    if (!email) return;
    if (voters.some(v => v.email === email)) {
      setError('Voter with this email already exists.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.post(`/elections/${id}/voters`, { email, name: email.split('@')[0] });
      setVoters(response.data.voters);
      setNewVoterEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add voter.');
    }
    setIsSaving(false);
  };

  const handleRemoveVoter = async (email) => {
    setIsSaving(true);
    try {
      const response = await api.delete(`/elections/${id}/voters/${email}`);
      setVoters(response.data.voters);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove voter.');
    }
    setIsSaving(false);
  };

  const handleEditClick = (voter) => {
    setEditingVoter(voter);
    setEditEmail(voter.email);
  };

  const handleCancelEdit = () => {
    setEditingVoter(null);
    setEditEmail('');
  };

  const handleSaveEdit = async (e, voterToUpdate) => {
    e.preventDefault();
    setError('');
    const newEmail = editEmail.trim().toLowerCase();
    
    if (!newEmail || newEmail === voterToUpdate.email) {
      handleCancelEdit();
      return;
    }
    if (voters.some(v => v.email === newEmail && v.email !== voterToUpdate.email)) {
      setError('A voter with this email already exists.');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await api.put(`/elections/${id}/voters/${voterToUpdate._id}`, { newEmail });
      setVoters(response.data.voters);
      handleCancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update voter.');
    }
    setIsSaving(false);
  };

  const isEditable = election && (election.status === 'draft' || election.status === 'scheduled');
  
  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <div className="sidebar-header-row">
          <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>&#9776;</button>
          <h2 className="voters-title">Election Voters</h2>
        </div>
        {error && <div className="message error">{error}</div>}
        <div className="voters-content">
          {isEditable && (
            <div className="add-voter-section">
              <h3>Add New Voter</h3>
              <form onSubmit={handleAddVoter} className="form-group">
                <input
                  type="email"
                  placeholder="Enter voter email"
                  value={newVoterEmail}
                  onChange={(e) => setNewVoterEmail(e.target.value)}
                  disabled={isSaving}
                  className="form-group-input"
                />
                <button type="submit" disabled={isSaving || !newVoterEmail} className="btn-primary">Add Voter</button>
              </form>
            </div>
          )}
          <div className="voters-list">
            <h3>Current Voters ({voters.length})</h3>
            {voters.length > 0 ? (
              <ul className="voters-grid">
                {voters.map((voter) => (
                  <li key={voter._id || voter.email} className="voter-card">
                    {editingVoter && editingVoter.email === voter.email ? (
                      <form onSubmit={(e) => handleSaveEdit(e, voter)} className="edit-form">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="edit-input"
                          autoFocus
                          disabled={isSaving}
                        />
                        <div className="edit-actions">
                          <button type="submit" className="save-btn" disabled={isSaving}>Save</button>
                          <button type="button" onClick={handleCancelEdit} className="cancel-btn" disabled={isSaving}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="voter-info">
                          <div className="voter-email">{voter.name} ({voter.email})</div>
                        </div>
                        <div className="voter-actions">
                          <button onClick={() => handleEditClick(voter)} className="edit-voter" disabled={!isEditable || isSaving}>Edit</button>
                          <button onClick={() => handleRemoveVoter(voter.email)} className="remove-voter" disabled={!isEditable || isSaving}>Remove</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-voters">No voters have been added to this election yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionVoters; 
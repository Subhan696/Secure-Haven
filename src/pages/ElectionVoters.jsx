import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVoterKey } from '../utils/voterKey';
import ElectionSidebar from '../components/ElectionSidebar';
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

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      if (found) {
        setElection(found);
        setVoters(found.voters || []);
      }
    }
  }, [id]);

  const handleAddVoter = (e) => {
    e.preventDefault();
    if (!newVoter.trim()) return;

    const email = newVoter.trim().toLowerCase();
    
    // Check if voter already exists
    if (voters.some(v => v.email === email)) {
      setMessage({
        type: 'error',
        text: 'This voter is already added to the election.'
      });
      return;
    }

    // Generate or get existing voter key
    const voterKey = getVoterKey(email);

    const updatedVoters = [...voters, { email, key: voterKey }];
    
    // Update election in localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const updatedElections = elections.map(e => {
      if (String(e.id) === String(id)) {
        return { ...e, voters: updatedVoters };
      }
      return e;
    });
    
    localStorage.setItem('elections', JSON.stringify(updatedElections));
    setVoters(updatedVoters);
    setNewVoter('');
    setMessage({
      type: 'success',
      text: 'Voter added successfully!'
    });

    // Update the election state to reflect the changes
    setElection(prev => ({
      ...prev,
      voters: updatedVoters
    }));
  };

  const handleEditVoter = (voter) => {
    setEditingVoter(voter);
    setEditEmail(voter.email);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editEmail.trim()) return;

    const newEmail = editEmail.trim().toLowerCase();
    
    // Check if the new email already exists (excluding the current voter)
    if (voters.some(v => v.email === newEmail && v.email !== editingVoter.email)) {
      setMessage({
        type: 'error',
        text: 'This email is already registered for another voter.'
      });
      return;
    }

    // Generate or get existing voter key for the new email
    const voterKey = getVoterKey(newEmail);

    const updatedVoters = voters.map(v => 
      v.email === editingVoter.email 
        ? { email: newEmail, key: voterKey }
        : v
    );
    
    // Update election in localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const updatedElections = elections.map(e => {
      if (String(e.id) === String(id)) {
        return { ...e, voters: updatedVoters };
      }
      return e;
    });
    
    localStorage.setItem('elections', JSON.stringify(updatedElections));
    setVoters(updatedVoters);
    setEditingVoter(null);
    setEditEmail('');
    setMessage({
      type: 'success',
      text: 'Voter updated successfully!'
    });

    // Update the election state to reflect the changes
    setElection(prev => ({
      ...prev,
      voters: updatedVoters
    }));
  };

  const handleCancelEdit = () => {
    setEditingVoter(null);
    setEditEmail('');
  };

  const handleRemoveVoter = (email) => {
    const updatedVoters = voters.filter(v => v.email !== email);
    
    // Update election in localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const updatedElections = elections.map(e => {
      if (String(e.id) === String(id)) {
        return { ...e, voters: updatedVoters };
      }
      return e;
    });
    
    localStorage.setItem('elections', JSON.stringify(updatedElections));
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
  };

  if (!election) return <div className="loading">Election not found</div>;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="voters-title">Manage Voters</h2>
        
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
                          <div className="voter-key">Key: {voter.key}</div>
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
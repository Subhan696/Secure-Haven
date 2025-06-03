import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionSettings.css';

const tabs = [
  { label: 'General', key: 'general' },
  { label: 'Dates', key: 'dates' },
  { label: 'Voters', key: 'voters' },
  { label: 'Launch', key: 'launch' },
  { label: 'Delete', key: 'delete' },
];

const MAX_DESC = 5000;
const timezones = [
  { value: 'Asia/Karachi', label: '(GMT+05:00) Asia/Karachi' },
  { value: 'America/New_York', label: '(GMT-05:00) America/New_York' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
];

const ElectionSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  // General
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  // Voters
  const [voters, setVoters] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  // Delete
  const [showDelete, setShowDelete] = useState(false);
  // Launch
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${id}`);
        
        if (response.data) {
          const election = response.data;
          setElection(election);
          setTitle(election.title || '');
          setDescription(election.description || '');
          setStartDate(election.startDate || '');
          setEndDate(election.endDate || '');
          setTimezone(election.timezone || 'Asia/Karachi');
          setVoters(election.voters || []);
          setError('');
        } else {
          setElection(null);
          setError('Election not found');
        }
      } catch (err) {
        console.error('Error fetching election:', err);
        setElection(null);
        setError(err.response?.data?.message || 'Failed to load election details');
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [id]);

  // General
  const handleSaveGeneral = () => {
    updateElection({ title, description });
  };
  // Dates
  const handleSaveDates = () => {
    updateElection({ startDate, endDate, timezone });
  };
  // Voters
  const handleEditVoter = idx => {
    setEditIdx(idx);
    setEditName(voters[idx].name);
    setEditEmail(voters[idx].email);
  };
  const handleSaveVoter = idx => {
    const updated = voters.map((v, i) => i === idx ? { name: editName, email: editEmail } : v);
    setVoters(updated);
    setEditIdx(null);
    updateElection({ voters: updated });
  };
  const handleDeleteVoter = idx => {
    const updated = voters.filter((_, i) => i !== idx);
    setVoters(updated);
    updateElection({ voters: updated });
  };
  // Delete
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteElection = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      // Send request to backend API to delete the election
      await api.delete(`/elections/${id}`);
      
      // Navigate to dashboard after successful deletion
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting election:', err);
      setError(err.response?.data?.message || 'Failed to delete election. Please try again.');
      setIsDeleting(false);
      setShowDelete(false);
    }
  };
  
  // Launch election
  const handleLaunchElection = async (status) => {
    try {
      setIsLaunching(true);
      setError('');
      setLaunchMessage('');
      
      // Send request to backend API to update election status
      const response = await api.put(`/elections/${id}/status`, { status });
      
      if (response.data) {
        // Update election state with new status
        setElection(prev => ({
          ...prev,
          status: status
        }));
        
        // Show success message
        setLaunchMessage(
          status === 'live' ? 'Election launched successfully!' : 
          status === 'ended' ? 'Election ended successfully!' : 
          'Election status updated successfully!'
        );
      }
    } catch (err) {
      console.error('Error updating election status:', err);
      setError(err.message || 'Failed to update election status. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  
  async function updateElection(fields) {
    try {
      setIsSaving(true);
      setError('');
      
      // Send request to backend API to update the election
      const response = await api.put(`/elections/${id}`, fields);
      
      if (response.data) {
        // Update the local state with the updated election data
        setElection(response.data);
        
        // Show success message or update UI as needed
        // You could add a success state here if desired
      }
    } catch (err) {
      console.error('Error updating election:', err);
      setError(err.response?.data?.message || 'Failed to update election. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

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
        <button onClick={() => navigate(-1)} className="back-button">
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
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main election-content-animated">
        <div className="sidebar-header-row">
  <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
    &#9776;
  </button>
  <h2 className="settings-title">Settings</h2>
</div>
        <div className="settings-content">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <div
                key={tab.key}
                className={`settings-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="settings-panel">
            {activeTab === 'general' && (
              <>
                <h3 className="settings-panel-title">General Settings</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
                    rows={8}
                    maxLength={MAX_DESC}
                  />
                  <div className="desc-count">Max Length: 5,000 characters. ({MAX_DESC - description.length} remaining)</div>
                </div>
                <button className="settings-save-btn" onClick={handleSaveGeneral}>Save</button>
              </>
            )}
            {activeTab === 'dates' && (
              <>
                <h3 className="settings-panel-title">Election Dates</h3>
                <div className="date-inputs-container">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <button className="settings-save-btn" onClick={handleSaveDates}>Save</button>
              </>
            )}
            {activeTab === 'voters' && (
              <>
                <h3 className="settings-panel-title">Voters</h3>
                <ul className="voters-list">
                  {voters.length === 0 && <li style={{ color: '#888' }}>No voters added.</li>}
                  {voters.map((v, idx) => (
                    <li key={idx} className="voter-item">
                      {editIdx === idx ? (
                        <>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ marginRight: 8 }}
                          />
                          <input
                            type="email"
                            value={editEmail}
                            onChange={e => setEditEmail(e.target.value)}
                            style={{ marginRight: 8 }}
                          />
                          <button className="settings-save-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => handleSaveVoter(idx)}>Save</button>
                          <button className="cancel-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => setEditIdx(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <span>{v.name} &lt;{v.email}&gt;</span>
                          <button className="edit-btn" style={{ marginLeft: 12, padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => handleEditVoter(idx)}>Edit</button>
                          <button className="cancel-btn" style={{ marginLeft: 6, padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => handleDeleteVoter(idx)}>Delete</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {activeTab === 'launch' && (
              <>
                <h3 className="settings-panel-title">Launch Election</h3>
                {launchMessage && (
                  <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px' }}>
                    {launchMessage}
                  </div>
                )}
                {error && (
                  <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px' }}>
                    {error}
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Current Status:</strong> {election?.status || 'draft'}</p>
                  <p>Change the status of your election to launch it or end it.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <button 
                    className="settings-save-btn" 
                    style={{ background: '#28a745' }}
                    onClick={() => handleLaunchElection('live')}
                    disabled={isLaunching || election?.status === 'live'}
                  >
                    {isLaunching ? 'Launching...' : 'Launch Election'}
                  </button>
                  <button 
                    className="settings-save-btn" 
                    style={{ background: '#ffc107', color: '#212529' }}
                    onClick={() => handleLaunchElection('scheduled')}
                    disabled={isLaunching || election?.status === 'scheduled'}
                  >
                    {isLaunching ? 'Scheduling...' : 'Schedule Election'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    style={{ background: '#dc3545', color: '#fff' }}
                    onClick={() => handleLaunchElection('ended')}
                    disabled={isLaunching || election?.status === 'ended' || election?.status === 'draft'}
                  >
                    {isLaunching ? 'Ending...' : 'End Election'}
                  </button>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <h4>Status Explanation:</h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    <li><strong>Draft:</strong> Election is being prepared and is not visible to voters.</li>
                    <li><strong>Scheduled:</strong> Election is visible to voters but voting is not yet open.</li>
                    <li><strong>Live:</strong> Election is active and voters can cast their votes.</li>
                    <li><strong>Ended:</strong> Election is closed and no more votes can be cast.</li>
                  </ul>
                </div>
              </>
            )}
            {activeTab === 'delete' && (
              <>
                <h3 className="settings-panel-title">Delete Election</h3>
                <p style={{ color: '#e74c3c', marginBottom: 16 }}>This action cannot be undone. Are you sure you want to delete this election?</p>
                <button className="cancel-btn" style={{ background: '#e74c3c', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }} onClick={() => setShowDelete(true)}>Delete Election</button>
                {showDelete && (
                  <div style={{ marginTop: 18 }}>
                    <span style={{ color: '#e74c3c', fontWeight: 600 }}>Are you absolutely sure?</span>
                    <button className="settings-save-btn" style={{ marginLeft: 16, background: '#e74c3c' }} onClick={handleDeleteElection}>Yes, Delete</button>
                    <button className="cancel-btn" style={{ marginLeft: 8 }} onClick={() => setShowDelete(false)}>Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionSettings; 
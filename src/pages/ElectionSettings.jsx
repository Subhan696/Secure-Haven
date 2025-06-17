import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionSettings.css';

const tabs = [
  { label: 'General', key: 'general' },
  { label: 'Dates', key: 'dates' },
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
  // Delete
  const [showDelete, setShowDelete] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Helper to format ISO date strings for datetime-local input
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
          setStartDate(formatDateTimeLocal(election.startDate) || '');
          setEndDate(formatDateTimeLocal(election.endDate) || '');
          setTimezone(election.timezone || 'Asia/Karachi');
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
    const fieldsToUpdate = { startDate, endDate, timezone };

    // Check if the election is currently completed or ended and endDate is being moved to the future
    if (election && (election.status === 'completed' || election.status === 'ended')) {
      const currentEndDate = new Date(election.endDate);
      const newEndDateObj = new Date(endDate);
      const now = new Date();

      // If the new end date is in the future and past the current date
      if (newEndDateObj > now && newEndDateObj > currentEndDate) {
        fieldsToUpdate.status = 'draft';
        console.log('Election status set to draft due to extended end date.');
      }
    }
    updateElection(fieldsToUpdate);
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

  // New function to set election status to draft
  const handleSetToDraft = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await api.put(`/elections/${id}/status`, { status: 'draft' });
      if (response.data) {
        setElection(prev => ({ ...prev, status: 'draft' }));
        alert('Election status set to Draft. You can now edit settings.');
      }
    } catch (err) {
      console.error('Error setting to draft:', err);
      setError(err.response?.data?.message || 'Failed to set election to draft.');
    } finally {
      setIsSaving(false);
    }
  };
  
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

  // Check if election is available and in editable status
  const isEditable = election && (election.status === 'draft' || election.status === 'scheduled' || election.status === 'ended');

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
            <div className="tab-content">
              {activeTab === 'general' && (
                <div className="settings-section general-settings">
                  <h2>General Election Settings</h2>
                  {election && (election.status === 'live' || election.status === 'completed') ? (
                    <div className="status-warning">
                      <p>
                        General settings are disabled because the election is currently{' '}
                        <strong>{election.status}</strong>.
                        To make changes, please revert the election to{' '}
                        <button onClick={() => handleSetToDraft()} disabled={isSaving}>
                          Draft
                        </button>
                        {' '}status.
                      </p>
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label htmlFor="title">Election Title</label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!isEditable || isSaving}
                      placeholder="Enter election title"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description (optional)</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={MAX_DESC}
                      disabled={!isEditable || isSaving}
                      placeholder="Provide a brief description of the election"
                    ></textarea>
                    <div className="char-count">
                      {description.length}/{MAX_DESC}
                    </div>
                  </div>
                  <button onClick={handleSaveGeneral} className="btn-primary" disabled={!isEditable || isSaving}>
                    {isSaving ? 'Saving...' : 'Save '}
                  </button>
                </div>
              )}

              {activeTab === 'dates' && (
                <div className="settings-section date-settings">
                  <h2>Election Dates & Timezone</h2>
                  {election && (election.status === 'live' || election.status === 'completed') ? (
                    <div className="status-warning">
                      <p>
                        Date settings are disabled because the election is currently{' '}
                        <strong>{election.status}</strong>.
                        To make changes, please revert the election to{' '}
                        <button onClick={() => handleSetToDraft()} disabled={isSaving}>
                          Draft
                        </button>
                        {' '}status.
                      </p>
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label htmlFor="startDate">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!isEditable || isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date & Time</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!isEditable || isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      disabled={!isEditable || isSaving}
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleSaveDates} className="btn-primary" disabled={!isEditable || isSaving}>
                    {isSaving ? 'Saving...' : 'Save '}
                  </button>
                </div>
              )}

              {activeTab === 'delete' && (
                <div className="settings-section delete-section">
                  <h2>Delete Election</h2>
                  <p>Permanently delete this election. This action cannot be undone.</p>
                  <button onClick={() => setShowDelete(true)} className="btn-delete" disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete Election'}
                  </button>
                  {showDelete && (
                    <div className="delete-confirmation">
                      <p>Are you sure you want to delete this election?</p>
                      <button onClick={handleDeleteElection} className="btn-delete" disabled={isDeleting}>Yes, Delete</button>
                      <button onClick={() => setShowDelete(false)} className="btn-secondary" disabled={isDeleting}>Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionSettings; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionSettings.css';

const tabs = [
  { label: 'General', key: 'general' },
  { label: 'Dates', key: 'dates' },
  { label: 'Voters', key: 'voters' },
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

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      setElection(found);
      if (found) {
        setTitle(found.title || '');
        setDescription(found.description || '');
        setStartDate(found.startDate || '');
        setEndDate(found.endDate || '');
        setTimezone(found.timezone || 'Asia/Karachi');
        setVoters(found.voters || []);
      }
    }
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
  const handleDeleteElection = () => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const arr = JSON.parse(stored).filter(e => String(e.id) !== String(id));
      localStorage.setItem('elections', JSON.stringify(arr));
      navigate('/dashboard');
    }
  };

  function updateElection(fields) {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const arr = JSON.parse(stored).map(e =>
        String(e.id) === String(id) ? { ...e, ...fields } : e
      );
      localStorage.setItem('elections', JSON.stringify(arr));
      setElection(arr.find(e => String(e.id) === String(id)));
    }
  }

  if (!election) return <div className="loading">Election not found</div>;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="settings-title">Settings</h2>
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
                <div className="form-row">
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
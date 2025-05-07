import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionDetails.css';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', timezone: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      if (found) {
        setElection(found);
        setForm({
          title: found.title,
          startDate: found.startDate,
          endDate: found.endDate,
          timezone: found.timezone,
        });
      }
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const arr = JSON.parse(stored).map(e =>
        String(e.id) === String(id) ? { ...e, ...form } : e
      );
      localStorage.setItem('elections', JSON.stringify(arr));
      setElection(arr.find(e => String(e.id) === String(id)));
      setEdit(false);
    }
  };

  if (!election) return <div className="loading">Election not found</div>;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <div className="step-indicator">
          <div className="step active">1. Confirm Details</div>
          <div className="step">2. Check Ballot</div>
        </div>
        <h2>Confirm Election Details</h2>
        <div className="election-details-card">
          {edit ? (
            <>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <input name="timezone" value={form.timezone} onChange={handleChange} />
              </div>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEdit(false)}>Cancel</button>
            </>
          ) : (
            <>
              <table className="details-table">
                <tbody>
                  <tr><td>Title</td><td>{election.title}</td></tr>
                  <tr><td>Start Date</td><td>{election.startDate ? new Date(election.startDate).toLocaleString() : ''}</td></tr>
                  <tr><td>End Date</td><td>{election.endDate ? new Date(election.endDate).toLocaleString() : ''}</td></tr>
                  <tr><td>Timezone</td><td>{election.timezone}</td></tr>
                </tbody>
              </table>
              <button className="edit-btn" onClick={() => setEdit(true)}>Edit Info</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateElection.css';

const timezones = [
  { value: 'Asia/Karachi', label: '(GMT+05:00) Asia/Karachi' },
  { value: 'America/New_York', label: '(GMT-05:00) America/New_York' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
  // Add more as needed
];

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    timezone: 'Asia/Karachi',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create election
    navigate('/dashboard/elections');
  };

  return (
    <div className="create-election">
      <h1>Create an Election</h1>
      <form onSubmit={handleSubmit} className="election-form-card">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Homecoming Court, Board of Directors"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            required
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="continue-btn">
          Continue <span className="continue-icon">&#9654;</span>
        </button>
      </form>
    </div>
  );
};

export default CreateElection; 
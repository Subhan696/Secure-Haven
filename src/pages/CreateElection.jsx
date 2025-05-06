import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateElection.css';

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', description: '' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index][field] = value;
    setFormData(prev => ({
      ...prev,
      candidates: newCandidates
    }));
  };

  const addCandidate = () => {
    setFormData(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '', description: '' }]
    }));
  };

  const removeCandidate = (index) => {
    setFormData(prev => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create election
    console.log('Election data:', formData);
    navigate('/dashboard/elections');
  };

  return (
    <div className="create-election">
      <h1>Create New Election</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Election Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
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

        <div className="candidates-section">
          <h2>Candidates</h2>
          {formData.candidates.map((candidate, index) => (
            <div key={index} className="candidate-form">
              <div className="form-group">
                <label htmlFor={`candidate-name-${index}`}>Candidate Name</label>
                <input
                  type="text"
                  id={`candidate-name-${index}`}
                  value={candidate.name}
                  onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`candidate-description-${index}`}>Description</label>
                <textarea
                  id={`candidate-description-${index}`}
                  value={candidate.description}
                  onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                  required
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  className="remove-candidate"
                  onClick={() => removeCandidate(index)}
                >
                  Remove Candidate
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-candidate" onClick={addCandidate}>
            Add Candidate
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Create Election</button>
          <button type="button" className="cancel-button" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionPreview.css';

const ElectionPreview = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${id}`);
        
        if (response.data) {
          setElection(response.data);
          // Initialize selected options for each question
          if (response.data.questions) {
            const initialSelections = {};
            response.data.questions.forEach((_, index) => {
              initialSelections[index] = null;
            });
            setSelectedOptions(initialSelections);
          }
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
  }, [id, navigate]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
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
</div>

        <div className="preview-container">
          <div className="preview-header">
            <h1 className="preview-title">{election.title}</h1>
            <div className="preview-info">
              <p className="preview-date">
                Election Period: {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
              </p>
              <p className="preview-timezone">Timezone: {election.timezone}</p>
            </div>
          </div>

          <div className="preview-instructions">
            <h2>Instructions</h2>
            {election.description && (
              <div className="election-description">
                <p>{election.description}</p>
              </div>
            )}
            <ul>
              <li>Please review each question carefully before making your selection.</li>
              <li>You can only select one option per question.</li>
              <li>Your vote is confidential and secure.</li>
              <li>You can review your selections before submitting.</li>
            </ul>
          </div>

          <div className="preview-ballot">
            {election.questions.map((question, qIndex) => (
              <div key={qIndex} className="preview-question">
                <h3 className="question-number">Question {qIndex + 1}</h3>
                <p className="question-text">{question.text}</p>
                <div className="options-container">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`option-item ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(qIndex, oIndex)}
                    >
                      <div className="option-radio">
                        <div className={`radio-inner ${selectedOptions[qIndex] === oIndex ? 'selected' : ''}`} />
                      </div>
                      <span className="option-text">{typeof option === 'object' ? option.text : option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="preview-actions">
            <button className="preview-submit-btn" disabled={Object.values(selectedOptions).some(v => v === null)}>
              Submit Ballot
            </button>
            <button className="preview-clear-btn" onClick={() => setSelectedOptions({})}>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionPreview; 
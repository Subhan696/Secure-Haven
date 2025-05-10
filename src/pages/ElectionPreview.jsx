import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionPreview.css';

const ElectionPreview = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      setElection(found);
      // Initialize selected options for each question
      if (found && found.questions) {
        const initialSelections = {};
        found.questions.forEach((_, index) => {
          initialSelections[index] = null;
        });
        setSelectedOptions(initialSelections);
      }
    }
  }, [id]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  if (!election) {
    return <div>Loading...</div>;
  }

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        
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
                      <span className="option-text">{option}</span>
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
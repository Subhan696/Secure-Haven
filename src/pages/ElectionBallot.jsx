import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionBallot.css';

const ElectionBallot = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['']);
  const [editIdx, setEditIdx] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editOptions, setEditOptions] = useState(['']);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch election data from backend API
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${id}`);
        
        if (response.data) {
          setElection(response.data);
          setQuestions(response.data.questions || []);
          setError('');
        } else {
          setElection(null);
          setQuestions([]);
          setError('Election not found');
        }
      } catch (err) {
        console.error('Error fetching election:', err);
        setElection(null);
        setQuestions([]);
        setError(err.response?.data?.message || 'Failed to load election details');
      } finally {
        setLoading(false);
      }
    };

    fetchElection();
  }, [id]);

  const handleAddOption = () => setNewOptions(opts => [...opts, '']);
  const handleRemoveOption = idx => setNewOptions(opts => opts.filter((_, i) => i !== idx));
  const handleOptionChange = (idx, value) => setNewOptions(opts => opts.map((opt, i) => i === idx ? value : opt));

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      setError('Question text is required.');
      return;
    }
    if (newOptions.length < 1 || newOptions.some(opt => !opt.trim())) {
      setError('Each question must have at least one non-empty option.');
      return;
    }
    const updated = [...questions, { text: newQuestion, options: newOptions.filter(opt => opt.trim()) }];
    setQuestions(updated);
    setNewQuestion('');
    setNewOptions(['']);
    setError('');
    updateElection({ questions: updated });
  };

  // Edit question
  const handleEditQuestion = idx => {
    setEditIdx(idx);
    setEditQuestion(questions[idx].text);
    setEditOptions(questions[idx].options);
  };
  const handleEditOptionChange = (idx, value) => setEditOptions(opts => opts.map((opt, i) => i === idx ? value : opt));
  const handleEditAddOption = () => setEditOptions(opts => [...opts, '']);
  const handleEditRemoveOption = idx => setEditOptions(opts => opts.filter((_, i) => i !== idx));
  const handleSaveEdit = idx => {
    if (!editQuestion.trim()) {
      setError('Question text is required.');
      return;
    }
    if (editOptions.length < 1 || editOptions.some(opt => !opt.trim())) {
      setError('Each question must have at least one non-empty option.');
      return;
    }
    const updated = questions.map((q, i) => i === idx ? { text: editQuestion, options: editOptions.filter(opt => opt.trim()) } : q);
    setQuestions(updated);
    setEditIdx(null);
    setError('');
    updateElection({ questions: updated });
  };
  const handleDeleteQuestion = idx => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setEditIdx(null);
    setError('');
    updateElection({ questions: updated });
  };

  async function updateElection(fields) {
    try {
      setLoading(true);
      // Send request to backend API to update election
      const response = await api.put(`/elections/${id}`, fields);
      
      if (response.data) {
        // Update the election state to reflect the changes
        setElection(response.data);
        setError('');
      }
    } catch (err) {
      console.error('Error updating election:', err);
      setError(err.response?.data?.message || 'Failed to update election. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Only allow voting if election is live
  if (!election) return <div className="loading">Election not found</div>;

  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);
  const isLive = election.launched && now >= startDate && now <= endDate;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading election details...</p>
      </div>
    );
  }

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <div className="sidebar-header-row">
          <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
            &#9776;
          </button>
          <h2 className="ballot-title">Ballot</h2>
        </div>
        {election && election.status === 'Ended' ? (
          <div className="ballot-closed-msg">
            This election has ended. Ballot editing is no longer allowed.
          </div>
        ) : (
          <div className="ballot-panel">
            <div className="ballot-add-section">
              <input
                type="text"
                placeholder="Enter question text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="ballot-question-input"
              />
              {newOptions.map((opt, idx) => (
                <div key={idx} className="ballot-option-row">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className="ballot-option-input"
                  />
                  {newOptions.length > 1 && (
                    <button className="ballot-remove-btn" onClick={() => handleRemoveOption(idx)}>Remove</button>
                  )}
                </div>
              ))}
              <button className="ballot-add-option-btn" onClick={handleAddOption}>Add Option</button>
              <button className="ballot-add-btn" onClick={handleAddQuestion}>Add Question</button>
            </div>
            {error && <div className="ballot-error">{error}</div>}
            <div className="ballot-questions-list">
              <h3>Questions</h3>
              {questions.length === 0 && <div style={{ color: '#888' }}>No questions added yet.</div>}
              {questions.map((q, idx) => (
                <div key={idx} className="ballot-question-item">
                  {editIdx === idx ? (
                    <>
                      <input
                        type="text"
                        value={editQuestion}
                        onChange={e => setEditQuestion(e.target.value)}
                        className="ballot-question-input"
                      />
                      {editOptions.map((opt, oidx) => (
                        <div key={oidx} className="ballot-option-row">
                          <input
                            type="text"
                            value={opt}
                            onChange={e => handleEditOptionChange(oidx, e.target.value)}
                            className="ballot-option-input"
                          />
                          {editOptions.length > 1 && (
                            <button className="ballot-remove-btn" onClick={() => handleEditRemoveOption(oidx)}>Remove</button>
                          )}
                        </div>
                      ))}
                      <button className="ballot-add-option-btn" onClick={handleEditAddOption}>Add Option</button>
                      <button className="ballot-add-btn" onClick={() => handleSaveEdit(idx)}>Save</button>
                      <button className="ballot-remove-btn" onClick={() => setEditIdx(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="ballot-question-text">{q.text}</div>
                      <ul className="ballot-options-list">
                        {q.options.map((opt, oidx) => <li key={oidx}>{opt}</li>)}
                      </ul>
                      <button className="edit-btn" onClick={() => handleEditQuestion(idx)}>Edit</button>
                      <button className="ballot-remove-btn" onClick={() => handleDeleteQuestion(idx)}>Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionBallot; 
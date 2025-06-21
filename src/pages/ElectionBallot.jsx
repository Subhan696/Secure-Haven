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
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingVotes, setHasExistingVotes] = useState(false);
  
  useEffect(() => {
    // Fetch election data from backend API
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${id}`);
        
        if (response.data) {
          setElection(response.data);
          setQuestions(response.data.questions || []);
          
          // Check if there are existing votes
          if (response.data.totalVotes && response.data.totalVotes > 0) {
            setHasExistingVotes(true);
          }
          
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

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.trim()) {
        setError('Question text is required.');
        return;
      }
      if (newOptions.length < 1 || newOptions.some(opt => !opt.trim())) {
        setError('Each question must have at least one non-empty option.');
        return;
      }

      const newQuestionData = {
        text: newQuestion.trim(),
        options: newOptions.filter(opt => opt.trim())
      };

      console.log('Adding new question:', newQuestionData); // Debug log

      const updated = [...questions, newQuestionData];
      
      // Update local state first
      setQuestions(updated);
      setNewQuestion('');
      setNewOptions(['']);
      setError('');

      // Then update the backend
      await updateElection({ questions: updated });
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question. Please try again.');
    }
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
  const handleSaveEdit = async (idx) => {
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
    await updateElection({ questions: updated });
  };
  const handleDeleteQuestion = async (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setEditIdx(null);
    setError('');
    await updateElection({ questions: updated });
  };

  // New function to set election status to draft
  const handleSetToDraft = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await api.put(`/elections/${id}/status`, { status: 'draft' });
      if (response.data) {
        setElection(prev => ({ ...prev, status: 'draft' }));
        alert('Election status set to Draft. You can now edit the ballot.');
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
      console.log('Updating election with fields:', fields); // Debug log
      
      // Send request to backend API to update election
      const response = await api.put(`/elections/${id}`, {
        ...election,
        ...fields
      });
      
      console.log('Update response:', response.data); // Debug log
      
      if (response.data) {
        // Update the election state to reflect the changes
        setElection(response.data);
        // Update questions state to ensure consistency
        setQuestions(response.data.questions || []);
        setError('');
      }
    } catch (err) {
      console.error('Error updating election:', err);
      console.error('Error details:', err.response?.data); // Debug log
      
      // Handle specific error for votes existing
      if (err.response?.data?.code === 'VOTES_EXIST') {
        setError('Cannot modify questions after voting has started. This would invalidate existing votes. Please revert the election to draft status first if you need to make changes.');
      } else {
      setError(err.response?.data?.message || 'Failed to update election. Please try again.');
      }
      
      // Revert the questions state to the previous state on error
      try {
        const response = await api.get(`/elections/${id}`);
        if (response.data) {
          setQuestions(response.data.questions || []);
        }
      } catch (refreshErr) {
        console.error('Error refreshing election data:', refreshErr);
      }
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
      <div className="election-details-main">
        <div className="sidebar-header-row">
          <button className="sidebar-toggle sidebar-toggle-mobile" aria-label="Open sidebar" onClick={() => setSidebarOpen(o => !o)}>
            &#9776;
          </button>
          <h2 className="ballot-title">Ballot</h2>
        </div>
        {!isEditable && election && election.status !== 'completed' && election.status !== 'live' && (
          <div className="status-warning">
            <p>
              Ballot editing is disabled because the election is currently{' '}
              <strong>{election.status}</strong>.
              To make changes, please revert the election to{' '}
              <button onClick={handleSetToDraft} disabled={isSaving}>
                Draft
              </button>
              {' '}status or wait for it to be scheduled/ended.
            </p>
          </div>
        )}
        
        {hasExistingVotes && isEditable && (
          <div className="votes-warning">
            <p>
              ⚠️ <strong>Voting has already started</strong> for this election. 
              Question and option modifications are now disabled to preserve vote integrity. 
              Any changes would invalidate existing votes and compromise data accuracy.
            </p>
          </div>
        )}
        {election && (election.status === 'completed' || election.status === 'live') ? (
          <div className="ballot-closed-msg">
            This election is {election.status}. Ballot editing is no longer allowed.
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
                disabled={!isEditable || isSaving || hasExistingVotes}
              />
              {newOptions.map((opt, idx) => (
                <div key={idx} className="ballot-option-row">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    className="ballot-option-input"
                    disabled={!isEditable || isSaving || hasExistingVotes}
                  />
                  {newOptions.length > 1 && (
                    <button className="ballot-remove-btn" onClick={() => handleRemoveOption(idx)} disabled={!isEditable || isSaving || hasExistingVotes}>Remove</button>
                  )}
                </div>
              ))}
              <button className="ballot-add-option-btn" onClick={handleAddOption} disabled={!isEditable || isSaving || hasExistingVotes}>Add Option</button>
              <button className="ballot-add-btn" onClick={handleAddQuestion} disabled={!isEditable || isSaving || hasExistingVotes}>Add Question</button>
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
                        disabled={!isEditable || isSaving || hasExistingVotes}
                      />
                      {editOptions.map((opt, oidx) => (
                        <div key={oidx} className="ballot-option-row">
                          <input
                            type="text"
                            value={opt}
                            onChange={e => handleEditOptionChange(oidx, e.target.value)}
                            className="ballot-option-input"
                            disabled={!isEditable || isSaving || hasExistingVotes}
                          />
                          {editOptions.length > 1 && (
                            <button className="ballot-remove-btn" onClick={() => handleEditRemoveOption(oidx)} disabled={!isEditable || isSaving || hasExistingVotes}>Remove</button>
                          )}
                        </div>
                      ))}
                      <button className="ballot-add-option-btn" onClick={handleEditAddOption} disabled={!isEditable || isSaving || hasExistingVotes}>Add Option</button>
                      <div className="ballot-actions">
                        <button onClick={() => handleSaveEdit(idx)} className="ballot-save-btn" disabled={!isEditable || isSaving || hasExistingVotes}>Save</button>
                        <button onClick={() => setEditIdx(null)} className="ballot-cancel-btn" disabled={!isEditable || isSaving || hasExistingVotes}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="question-display">
                      <h4>{q.text}</h4>
                      <ul>
                        {q.options.map((opt, oidx) => (
                          <li key={oidx}>{opt.text}</li>
                        ))}
                      </ul>
                      <div className="ballot-actions">
                        <button onClick={() => handleEditQuestion(idx)} className="ballot-edit-btn" disabled={!isEditable || isSaving || hasExistingVotes}>Edit</button>
                        <button onClick={() => handleDeleteQuestion(idx)} className="ballot-delete-btn" disabled={!isEditable || isSaving || hasExistingVotes}>Delete</button>
                      </div>
                    </div>
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
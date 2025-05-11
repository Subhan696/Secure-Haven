import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
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

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      if (found) {
        // Dynamically recalculate status
        const now = new Date();
        const startDate = new Date(found.startDate);
        const endDate = new Date(found.endDate);
        let status = found.status;
        if (found.launched) {
          if (now > endDate) {
            status = 'Ended';
          } else if (now >= startDate && now <= endDate) {
            status = 'Live';
          } else if (now < startDate) {
            status = 'Upcoming';
          }
        } else {
          if (now > endDate) {
            status = 'Draft'; // not launched, ended
          } else {
            status = 'Draft';
          }
        }
        found.status = status;
        setElection(found);
        setQuestions(found && found.questions ? found.questions : []);
      } else {
        setElection(null);
      }
    }
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

  // Only allow voting if election is live
  if (!election) return <div className="loading">Election not found</div>;

  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);
  const isLive = election.launched && now >= startDate && now <= endDate;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="ballot-title">Ballot</h2>
        {!isLive ? (
          <div className="ballot-closed-msg">
            This election is not live. Please check the start and end time in settings.
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
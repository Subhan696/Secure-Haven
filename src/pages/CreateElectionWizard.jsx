import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './CreateElectionWizard.css';

const steps = [
  'Basic Info',
  'Build Ballot',
  'Add Voters',
  'Review & Save'
];

const timezones = [
  { value: 'Asia/Karachi', label: '(GMT+05:00) Asia/Karachi' },
  { value: 'America/New_York', label: '(GMT-05:00) America/New_York' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
  // Add more as needed
];

function StepIndicator({ currentStep }) {
  return (
    <div className="wizard-step-indicator" data-current-step={currentStep}>
      {steps.map((step, idx) => (
        <div
          key={step}
          className={`wizard-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
          data-step={idx + 1}
        >
          {step}
        </div>
      ))}
    </div>
  );
}

function BasicInfoForm({ onNext, onCancel, data, setData }) {
  const [local, setLocal] = useState({
    title: data.title || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    timezone: data.timezone || 'Asia/Karachi',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!local.title.trim()) errs.title = 'Title is required.';
    if (!local.startDate) errs.startDate = 'Start date is required.';
    if (!local.endDate) errs.endDate = 'End date is required.';
    if (local.startDate && local.endDate && local.startDate > local.endDate) errs.endDate = 'End date must be after start date.';
    if (!local.timezone) errs.timezone = 'Timezone is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) {
      setData(prev => ({ ...prev, ...local }));
      onNext();
    }
  };

  return (
    <form onSubmit={handleNext} className="wizard-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-control"
          placeholder="e.g. Homecoming Court, Board of Directors"
          value={local.title}
          onChange={handleChange}
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            className="form-control"
            value={local.startDate}
            onChange={handleChange}
          />
          {errors.startDate && <div className="form-error">{errors.startDate}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            className="form-control"
            value={local.endDate}
            onChange={handleChange}
          />
          {errors.endDate && <div className="form-error">{errors.endDate}</div>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          name="timezone"
          className="form-control"
          value={local.timezone}
          onChange={handleChange}
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
        {errors.timezone && <div className="form-error">{errors.timezone}</div>}
      </div>
      <div className="wizard-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Next</button>
      </div>
    </form>
  );
}

function BallotBuilder({ onNext, onBack, onCancel, data, setData }) {
  const [questions, setQuestions] = useState(data.questions || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [ballotError, setBallotError] = useState('');

  const handleAddOption = () => setNewOptions(opts => [...opts, '']);
  const handleRemoveOption = idx => setNewOptions(opts => opts.filter((_, i) => i !== idx));
  const handleOptionChange = (idx, value) => setNewOptions(opts => opts.map((opt, i) => i === idx ? value : opt));

  const handleAddQuestion = () => {
    setBallotError(''); // Clear previous errors
    
    const validOptions = newOptions.filter(opt => opt.trim());

    if (!newQuestion.trim()) {
      setBallotError('Question text cannot be empty.');
      return;
    }
    if (validOptions.length < 2) {
      setBallotError('A question must have at least two non-empty options.');
      return;
    }

    const updated = [...questions, { text: newQuestion, options: validOptions }];
    setQuestions(updated);
    setNewQuestion('');
    setNewOptions(['', '']);
    setData(prev => ({ ...prev, questions: updated }));
  };

  return (
    <div className="wizard-form">
      <div className="ballot-builder-section">
        <h3>Add Questions</h3>
        <div className="form-group">
          <input
            type="text"
            id="question-text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="Enter question"
            className="form-control"
          />
        </div>
        <div className="ballot-options">
          {newOptions.map((opt, idx) => (
            <div key={idx} className="ballot-option">
              <input
                type="text"
                id={`option-input-${idx}`}
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="form-control"
              />
              {newOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="btn btn-danger"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="add-option-btn"
          >
            <span>+</span> Add Option
          </button>
        </div>
        {ballotError && <div className="form-error" style={{ marginBottom: '1rem' }}>{ballotError}</div>}
        <button
          type="button"
          onClick={handleAddQuestion}
          id="add-question-btn"
          className="btn btn-primary"
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <div className="ballot-items">
          <h3>Current Questions</h3>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="ballot-item">
              <div className="ballot-item-header">
                <h4 className="ballot-item-title">{q.text}</h4>
              </div>
              <ul className="ballot-item-options">
                {q.options.map((opt, oIdx) => (
                  <li key={oIdx}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="wizard-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="button" onClick={onBack} className="btn btn-secondary">Back</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Next</button>
      </div>
    </div>
  );
}

function VoterManagement({ onNext, onBack, onCancel, data, setData }) {
  const [voters, setVoters] = useState(data.voters || []);
  const [newVoter, setNewVoter] = useState('');
  const [error, setError] = useState('');

  const handleAddVoter = (e) => {
    e.preventDefault();
    setError('');
    if (!newVoter.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newVoter)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (voters.some(voter => typeof voter === 'string' ? voter === newVoter : voter.email === newVoter)) {
      setError('This email is already added');
      return;
    }

    try {
      // The backend will now generate the voter key.
      // const voterKey = getVoterKey(newVoter); 
      
      // Create a proper voter object without the key
      const voterObj = {
        name: newVoter.split('@')[0], // Use part before @ as name
        email: newVoter,
        // voterKey: voterKey // This is now handled by the backend
      };

      const updated = [...voters, voterObj];
      setVoters(updated);
      setData(prev => ({ ...prev, voters: updated }));
      setNewVoter('');
      console.log('Voter added:', voterObj);
      console.log('Updated voters list:', updated);
    } catch (err) {
      console.error('Error adding voter:', err);
      setError('Failed to add voter. Please try again.');
    }
  };

  const handleRemoveVoter = (email) => {
    try {
      // Create a new array without the voter to be removed
      const updated = voters.filter(voter => {
        if (typeof voter === 'string') {
          return voter !== email;
        }
        return voter.email !== email;
      });
      
      // Update both the local state and the parent component's state
      setVoters(updated);
      setData(prev => ({ ...prev, voters: updated }));
      console.log('Voter removed. Updated voters list:', updated);
    } catch (err) {
      console.error('Error removing voter:', err);
      setError('Failed to remove voter. Please try again.');
    }
  };

  return (
    <div className="wizard-form">
      <div className="add-voter-section">
        <h3>Add Voters</h3>
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleAddVoter} className="form-group">
          <input
            type="email"
            id="voter-email-input"
            value={newVoter}
            onChange={e => setNewVoter(e.target.value)}
            placeholder="Enter voter's email"
            className="form-control"
          />
          <button
            type="submit"
            id="add-voter-btn"
            className="btn btn-primary"
          >
            Add Voter
          </button>
        </form>
      </div>

      {voters.length > 0 && (
        <div className="voters-list">
          <h3>Current Voters</h3>
          <div className="voters-grid">
            {voters.map((voter, idx) => (
              <div key={idx} className="voter-card">
                <div className="voter-info">
                  <div className="voter-email">{voter.email}</div>
                  <div className="voter-key">
                    <strong>Key:</strong> {voter.voterKey || 'N/A'}
                  </div>
                </div>
                <div className="voter-actions">
                  <button
                    type="button"
                    onClick={() => handleRemoveVoter(voter.email)}
                    className="remove-voter"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wizard-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="button" onClick={onBack} className="btn btn-secondary">Back</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Next</button>
      </div>
    </div>
  );
}

function ReviewSave({ onSave, onBack, onCancel, data, isSaving, error }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Review & Save</h2>
      
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: 4, marginBottom: 24 }}>
          {error}
        </div>
      )}
      
      <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 8 }}>Basic Information</h4>
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Start Date:</strong> {new Date(data.startDate).toLocaleString()}</p>
          <p><strong>End Date:</strong> {new Date(data.endDate).toLocaleString()}</p>
          <p><strong>Timezone:</strong> {data.timezone}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 8 }}>Questions</h4>
          {data.questions?.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <p><strong>Question {idx + 1}:</strong> {q.text}</p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {q.options.map((opt, oIdx) => (
                  <li key={oIdx}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h4 style={{ marginBottom: 8 }}>Voters</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {data.voters?.map((voter, idx) => (
              <li key={idx}>{voter.email}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isSaving}
          style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={onBack} 
          disabled={isSaving}
          style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={onSave} 
          disabled={isSaving}
          style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Saving...' : 'Save Election'}
        </button>
      </div>
    </div>
  );
}

const CreateElectionWizard = () => {
  const { onboardingTour, setOnboardingTour, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userElections, setUserElections] = useState([]);

  useEffect(() => {
    // Fetch elections for the current user on mount
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections');
        if (response.data && response.data.elections) {
          setUserElections(response.data.elections);
          if (response.data.elections.length === 0) {
            setOnboardingTour('wizard');
          }
        } else {
          setUserElections([]);
          setOnboardingTour('wizard');
        }
      } catch (err) {
        setUserElections([]);
        setOnboardingTour('wizard');
      }
    };
    fetchElections();
  }, [setOnboardingTour, currentUser]);

  const tourSteps = {
    info: [
      {
        target: '#title',
        content: 'First, give your election a clear and descriptive title.',
        disableBeacon: true,
      },
      {
        target: '#startDate',
        content: 'Now, set the start date and time for your election.',
      },
      {
        target: '#endDate',
        content: 'And the end date and time. This must be after the start date.',
      },
      {
        target: '.wizard-actions .btn-primary',
        content: "Once you're done, click Next to build the ballot.",
      },
    ],
    ballot: [
      {
        target: '#question-text',
        content: 'First, enter the text for your question or the title of the office (e.g., "President").',
        disableBeacon: true,
      },
      {
        target: '#option-input-0',
        content: 'Next, enter the first option or candidate for this question.',
      },
      {
        target: '#option-input-1',
        content: "Now, enter the second option. Remember, a question needs at least two choices.",
      },
      {
        target: '#add-question-btn',
        content: 'Once your question and its options are ready, click here to add it to the ballot.',
      },
      {
        target: '.wizard-actions .btn-primary',
        content: 'When you are finished adding questions, click Next to add voters.',
      }
    ],
    voters: [
      {
        target: '#voter-email-input',
        content: 'You can add eligible voters one by one using their email address.',
        disableBeacon: true,
      },
      {
        target: '#add-voter-btn',
        content: 'Click here to add the voter to the list.',
      },
      {
       target: '.wizard-actions .btn-primary',
       content: "When you're done adding voters, click Next to review your election. This will conclude the tour.",
      }
    ]
  };

  const [currentTourSteps, setCurrentTourSteps] = useState([]);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [runTour, setRunTour] = useState(false);

  const [step, setStep] = useState(0);
  const [wizardData, setWizardData] = useState({});

  useEffect(() => {
    if (onboardingTour === 'wizard') {
      let newSteps = [];
      if (step === 0) newSteps = tourSteps.info;
      else if (step === 1) newSteps = tourSteps.ballot;
      else if (step === 2) newSteps = tourSteps.voters;
      
      setCurrentTourSteps(newSteps);
      setTourStepIndex(0); // Reset index for the new chapter
      setRunTour(newSteps.length > 0); // Only run the tour if there are steps for the current view
    }
  }, [step, onboardingTour]);
  
  const handleWizardTourCallback = async (data) => {
    const { action, index, status, type } = data;

    if (type === EVENTS.STEP_AFTER) {
      setTourStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      setRunTour(false); // Always stop the tour run for the current chapter

      // If the final chapter is finished, mark onboarding as complete
      if (step === 2 && status === STATUS.FINISHED) {
        setOnboardingTour(''); // Fully end the tour process
        try {
          await api.post('/users/me/complete-onboarding');
        } catch (error) {
          console.error("Failed to mark onboarding as complete", error);
        }
      } else if (status === STATUS.SKIPPED || action === 'close') {
        // If tour was skipped or closed at any point, turn it off completely
        setOnboardingTour('');
      }
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      // Log the current user for debugging
      console.log('Current user:', currentUser);
      console.log('Wizard data:', wizardData);
      
      // Process voters to ensure they have the correct format
      const processedVoters = wizardData.voters ? wizardData.voters.map(voter => {
        // If voter is already in the correct format, return it as is
        if (voter && typeof voter === 'object' && voter.name && voter.email) {
          return voter;
        }
        // If voter is just an email string, create a proper voter object
        if (typeof voter === 'string') {
          return {
            name: voter.split('@')[0], // Use part before @ as name
            email: voter
            // The backend will generate a consistent voterKey
          };
        }
        return null;
      }).filter(Boolean) : [];
      
      // Prepare election data for API
      const electionData = {
        title: wizardData.title,
        description: wizardData.description || '',
        startDate: wizardData.startDate,
        endDate: wizardData.endDate,
        timezone: wizardData.timezone || 'Asia/Karachi',
        status: 'draft', // Elections will only become active when manually launched
        questions: wizardData.questions || [],
        voters: processedVoters
      };
      
      console.log('Sending election data to API:', electionData);
      
      // Send request to backend API to create the election
      const response = await api.post('/elections', electionData);
      
      console.log('API response:', response.data);
      
      if (response.data) {
        // If this is the first election, stop all tours, then set onboarding for dashboard launch after a short delay
        if (Array.isArray(response.data.allElections) && response.data.allElections.length === 1) {
          setOnboardingTour(''); // Stop any running tour
          setTimeout(() => setOnboardingTour('dashboard-launch'), 200); // Set up dashboard tour after redirect
        }
        // Navigate to dashboard after successful creation
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating election:', err);
      setError(err.response?.data?.message || 'Failed to create election. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32 }}>
      <Joyride
        key={step}
        steps={currentTourSteps}
        run={runTour}
        stepIndex={tourStepIndex}
        callback={handleWizardTourCallback}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose={true}
        spotlightClicks={true}
        styles={{ options: { primaryColor: '#4a90e2', zIndex: 10000 } }}
      />
      <StepIndicator currentStep={step} />
      {step === 0 && <BasicInfoForm onNext={handleNext} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 1 && <BallotBuilder onNext={handleNext} onBack={handleBack} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 2 && <VoterManagement onNext={handleNext} onBack={handleBack} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 3 && <ReviewSave onSave={handleSave} onBack={handleBack} onCancel={handleCancel} data={wizardData} isSaving={isSaving} error={error} />}
    </div>
  );
};

export default CreateElectionWizard; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="wizard-step-indicator" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((step, idx) => (
        <div
          key={step}
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            background: idx === currentStep ? '#3498db' : '#e0e7ef',
            color: idx === currentStep ? '#fff' : '#222',
            fontWeight: idx === currentStep ? 600 : 400,
            marginRight: idx < steps.length - 1 ? 12 : 0,
            fontSize: 16,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {idx + 1}. {step}
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
    <form onSubmit={handleNext} style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="e.g. Homecoming Court, Board of Directors"
          value={local.title}
          onChange={handleChange}
        />
        {errors.title && <div style={{ color: 'red', fontSize: 14 }}>{errors.title}</div>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={local.startDate}
            onChange={handleChange}
          />
          {errors.startDate && <div style={{ color: 'red', fontSize: 14 }}>{errors.startDate}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={local.endDate}
            onChange={handleChange}
          />
          {errors.endDate && <div style={{ color: 'red', fontSize: 14 }}>{errors.endDate}</div>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          name="timezone"
          value={local.timezone}
          onChange={handleChange}
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
        {errors.timezone && <div style={{ color: 'red', fontSize: 14 }}>{errors.timezone}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onCancel} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
        <button type="submit" style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Next</button>
      </div>
    </form>
  );
}

function BallotBuilder({ onNext, onBack, onCancel, data, setData }) {
  const [questions, setQuestions] = useState(data.questions || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['']);

  const handleAddOption = () => setNewOptions(opts => [...opts, '']);
  const handleRemoveOption = idx => setNewOptions(opts => opts.filter((_, i) => i !== idx));
  const handleOptionChange = (idx, value) => setNewOptions(opts => opts.map((opt, i) => i === idx ? value : opt));

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    if (newOptions.length < 1 || newOptions.some(opt => !opt.trim())) return;

    const updated = [...questions, { text: newQuestion, options: newOptions.filter(opt => opt.trim()) }];
    setQuestions(updated);
    setNewQuestion('');
    setNewOptions(['']);
    setData(prev => ({ ...prev, questions: updated }));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add Questions</h3>
        <div className="form-group">
          <input
            type="text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="Enter question"
            style={{ width: '100%', padding: '0.7rem', borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          {newOptions.map((opt, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                style={{ flex: 1, padding: '0.7rem', borderRadius: 4, border: '1px solid #ddd' }}
              />
              {newOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', marginTop: 8, cursor: 'pointer' }}
          >
            Add Option
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
          style={{ background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', marginTop: 16, cursor: 'pointer' }}
        >
          Add Question
        </button>
      </div>

      {questions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Current Questions</h3>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
              <h4 style={{ marginBottom: 8 }}>{q.text}</h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {q.options.map((opt, oIdx) => (
                  <li key={oIdx}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onCancel} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={onNext} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  );
}

function VoterManagement({ onNext, onBack, onCancel, data, setData }) {
  const [voters, setVoters] = useState(data.voters || []);
  const [newVoter, setNewVoter] = useState('');

  const handleAddVoter = (e) => {
    e.preventDefault();
    if (!newVoter.trim()) return;

    const email = newVoter.trim().toLowerCase();
    if (voters.some(v => v.email === email)) {
      alert('This voter is already added.');
      return;
    }

    const updated = [...voters, { email, name: email.split('@')[0] }];
    setVoters(updated);
    setNewVoter('');
    setData(prev => ({ ...prev, voters: updated }));
  };

  const handleRemoveVoter = (email) => {
    const updated = voters.filter(v => v.email !== email);
    setVoters(updated);
    setData(prev => ({ ...prev, voters: updated }));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add Voters</h3>
        <form onSubmit={handleAddVoter} style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={newVoter}
            onChange={e => setNewVoter(e.target.value)}
            placeholder="Enter voter's email"
            style={{ flex: 1, padding: '0.7rem', borderRadius: 4, border: '1px solid #ddd' }}
          />
          <button
            type="submit"
            style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', cursor: 'pointer' }}
          >
            Add Voter
          </button>
        </form>
      </div>

      {voters.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Current Voters</h3>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16 }}>
            {voters.map((voter, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < voters.length - 1 ? '1px solid #ddd' : 'none' }}>
                <span>{voter.email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveVoter(voter.email)}
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onCancel} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={onNext} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  );
}

function ReviewSave({ onSave, onBack, onCancel, data }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 24 }}>Review Election Details</h3>
      
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
        <button type="button" onClick={onCancel} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={onSave} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Save Election</button>
      </div>
    </div>
  );
}

const CreateElectionWizard = () => {
  const [step, setStep] = useState(0);
  const [wizardData, setWizardData] = useState({});
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSave = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Determine election status based on dates
    const now = new Date();
    const startDate = new Date(wizardData.startDate);
    const endDate = new Date(wizardData.endDate);
    
    let status = 'Building';
    if (now >= startDate && now <= endDate) {
      status = 'Live';
    } else if (now > endDate) {
      status = 'Ended';
    } else if (now < startDate) {
      status = 'Upcoming';
    }

    // Save election to localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const newElection = {
      ...wizardData,
      id: Date.now(),
      status: status,
      createdBy: currentUser.email,
      createdAt: new Date().toISOString(),
      totalVoters: wizardData.voters ? wizardData.voters.length : 0,
      totalVotes: 0,
      description: wizardData.description || '',
    };
    elections.push(newElection);
    localStorage.setItem('elections', JSON.stringify(elections));
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32 }}>
      <StepIndicator currentStep={step} />
      {step === 0 && <BasicInfoForm onNext={handleNext} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 1 && <BallotBuilder onNext={handleNext} onBack={handleBack} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 2 && <VoterManagement onNext={handleNext} onBack={handleBack} onCancel={handleCancel} data={wizardData} setData={setWizardData} />}
      {step === 3 && <ReviewSave onSave={handleSave} onBack={handleBack} onCancel={handleCancel} data={wizardData} />}
    </div>
  );
};

export default CreateElectionWizard; 
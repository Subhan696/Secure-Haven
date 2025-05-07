import React, { useState } from 'react';

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
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['']);
  const [questions, setQuestions] = useState(data.questions || []);
  const [error, setError] = useState('');

  const handleOptionChange = (idx, value) => {
    setOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => setOptions(opts => [...opts, '']);
  const removeOption = (idx) => setOptions(opts => opts.filter((_, i) => i !== idx));

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }
    if (options.length < 1 || options.some(opt => !opt.trim())) {
      setError('Each question must have at least one non-empty option.');
      return;
    }
    setQuestions(qs => [...qs, { text: questionText, options: options.filter(opt => opt.trim()) }]);
    setQuestionText('');
    setOptions(['']);
    setError('');
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }
    setData(prev => ({ ...prev, questions }));
    onNext();
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Build Ballot</h2>
      <div className="form-group">
        <label>Question</label>
        <input
          type="text"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          placeholder="Enter your question (e.g. Who should be President?)"
        />
      </div>
      <div className="form-group">
        <label>Options</label>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="text"
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              style={{ flex: 1 }}
            />
            {options.length > 1 && (
              <button type="button" onClick={() => removeOption(idx)} style={{ marginLeft: 8, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addOption} style={{ marginTop: 8, background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.4rem 1.2rem', cursor: 'pointer' }}>Add Option</button>
      </div>
      <button type="button" onClick={handleAddQuestion} style={{ background: '#18c018', color: '#fff', border: 'none', borderRadius: 4, padding: '0.6rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer', marginTop: 12 }}>Add Question</button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        <h3>Questions Added</h3>
        {questions.length === 0 && <div style={{ color: '#888' }}>No questions added yet.</div>}
        {questions.map((q, idx) => (
          <div key={idx} style={{ background: '#f7f9fa', borderRadius: 6, padding: 12, marginBottom: 10, position: 'relative' }}>
            <div style={{ fontWeight: 500 }}>{idx + 1}. {q.text}</div>
            <ul style={{ margin: '8px 0 0 18px' }}>
              {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
            </ul>
            <button type="button" onClick={() => handleRemoveQuestion(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={handleNext} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Next</button>
        <button type="button" onClick={onCancel} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

function VoterManagement({ onNext, onBack, onCancel, data, setData }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voters, setVoters] = useState(data.voters || []);
  const [error, setError] = useState('');

  const handleAddVoter = () => {
    if (!name.trim() || !email.trim()) {
      setError('Both name and email are required.');
      return;
    }
    // Simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setVoters(vs => [...vs, { name: name.trim(), email: email.trim() }]);
    setName('');
    setEmail('');
    setError('');
  };

  const handleRemoveVoter = (idx) => {
    setVoters(vs => vs.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (voters.length === 0) {
      setError('Please add at least one voter.');
      return;
    }
    setData(prev => ({ ...prev, voters }));
    onNext();
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Add Voters</h2>
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Voter Name"
          />
        </div>
        <div className="form-group" style={{ flex: 3 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Voter Email"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 8 }}>
          <button type="button" onClick={handleAddVoter} style={{ background: '#18c018', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Add Voter</button>
        </div>
      </div>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 32 }}>
        <h3>Voters Added</h3>
        {voters.length === 0 && <div style={{ color: '#888' }}>No voters added yet.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {voters.map((v, idx) => (
            <li key={idx} style={{ background: '#f7f9fa', borderRadius: 6, padding: 12, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{v.name} &lt;{v.email}&gt;</span>
              <button type="button" onClick={() => handleRemoveVoter(idx)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={handleNext} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Next</button>
        <button type="button" onClick={onCancel} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

function ReviewSave({ onSave, onBack, onCancel, data }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Review & Save</h2>
      <div style={{ background: '#f7f9fa', borderRadius: 6, padding: 18, marginBottom: 24 }}>
        <h3>Basic Info</h3>
        <div><b>Title:</b> {data.title}</div>
        <div><b>Start Date:</b> {data.startDate ? new Date(data.startDate).toLocaleString() : ''}</div>
        <div><b>End Date:</b> {data.endDate ? new Date(data.endDate).toLocaleString() : ''}</div>
        <div><b>Timezone:</b> {data.timezone}</div>
      </div>
      <div style={{ background: '#f7f9fa', borderRadius: 6, padding: 18, marginBottom: 24 }}>
        <h3>Ballot Questions</h3>
        {(!data.questions || data.questions.length === 0) && <div style={{ color: '#888' }}>No questions added.</div>}
        {data.questions && data.questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 500 }}>{idx + 1}. {q.text}</div>
            <ul style={{ margin: '8px 0 0 18px' }}>
              {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ background: '#f7f9fa', borderRadius: 6, padding: 18, marginBottom: 24 }}>
        <h3>Voters</h3>
        {(!data.voters || data.voters.length === 0) && <div style={{ color: '#888' }}>No voters added.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.voters && data.voters.map((v, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>{v.name} &lt;{v.email}&gt;</li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button type="button" onClick={onBack} style={{ background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Back</button>
        <button type="button" onClick={onSave} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 2.2rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Save Election</button>
        <button type="button" onClick={onCancel} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '0.7rem 1.5rem', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

const CreateElectionWizard = () => {
  const [step, setStep] = useState(0);
  const [wizardData, setWizardData] = useState({});

  const handleCancel = () => {
    window.location.href = '/dashboard';
  };
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const handleSave = () => {
    // Save election to localStorage
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const newElection = {
      ...wizardData,
      id: Date.now(),
      status: 'Building',
      totalVoters: wizardData.voters ? wizardData.voters.length : 0,
      totalVotes: 0,
      description: '', // Placeholder if needed
    };
    elections.push(newElection);
    localStorage.setItem('elections', JSON.stringify(elections));
    window.location.href = '/dashboard';
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
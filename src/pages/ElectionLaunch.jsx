import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionLaunch.css';

const ElectionLaunch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      setElection(found);
    }
  }, [id]);

  const handleLaunch = () => {
    setIsLaunching(true);
    const stored = localStorage.getItem('elections');
    if (stored) {
      const elections = JSON.parse(stored);
      const updatedElections = elections.map(e => 
        String(e.id) === String(id) 
          ? { ...e, status: 'live', launchDate: new Date().toISOString() }
          : e
      );
      localStorage.setItem('elections', JSON.stringify(updatedElections));
      setElection(prev => ({ ...prev, status: 'live', launchDate: new Date().toISOString() }));
    }
    setIsLaunching(false);
    navigate('/dashboard');
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
        
        <div className="launch-container">
          <div className="launch-header">
            <h1 className="launch-title">Launch Election</h1>
            <div className={`launch-status ${election.status === 'live' ? 'live' : 'draft'}`}>
              {election.status === 'live' ? 'Live' : 'Draft'}
            </div>
          </div>

          <div className="launch-info-section">
            <h2>Election Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Title</label>
                <p>{election.title}</p>
              </div>
              <div className="info-item">
                <label>Start Date</label>
                <p>{new Date(election.startDate).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>End Date</label>
                <p>{new Date(election.endDate).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Timezone</label>
                <p>{election.timezone}</p>
              </div>
              <div className="info-item">
                <label>Questions</label>
                <p>{election.questions?.length || 0}</p>
              </div>
              <div className="info-item">
                <label>Voters</label>
                <p>{election.voters?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="launch-checklist">
            <h2>Pre-Launch Checklist</h2>
            <ul>
              <li className={election.title ? 'completed' : ''}>
                <span className="check-icon">✓</span>
                Election title is set
              </li>
              <li className={election.startDate && election.endDate ? 'completed' : ''}>
                <span className="check-icon">✓</span>
                Start and end dates are configured
              </li>
              <li className={election.questions?.length > 0 ? 'completed' : ''}>
                <span className="check-icon">✓</span>
                At least one question is added
              </li>
              <li className={election.voters?.length > 0 ? 'completed' : ''}>
                <span className="check-icon">✓</span>
                Voters are added to the election
              </li>
            </ul>
          </div>

          <div className="launch-actions">
            {election.status !== 'live' ? (
              <button 
                className="launch-btn"
                onClick={handleLaunch}
                disabled={isLaunching || !election.title || !election.startDate || !election.endDate || !election.questions?.length || !election.voters?.length}
              >
                {isLaunching ? 'Launching...' : 'Launch Election'}
              </button>
            ) : (
              <div className="launch-success">
                <span className="success-icon">✓</span>
                Election is live
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionLaunch; 
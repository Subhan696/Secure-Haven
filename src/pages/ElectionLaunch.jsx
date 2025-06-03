import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import api from '../utils/api';
import './ElectionLaunch.css';

const ElectionLaunch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/elections/${id}`);
        
        if (response.data) {
          setElection(response.data);
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
  }, [id]);

  const handleLaunch = async () => {
    try {
      setIsLaunching(true);
      setError('');
      
      // Send request to backend API to update election status to 'live'
      const response = await api.put(`/elections/${id}/status`, { status: 'live' });
      
      if (response.data) {
        console.log('Election launched successfully:', response.data);
        
        // Update the local state with the updated election data
        setElection(prev => ({
          ...prev,
          status: 'live'
        }));
        
        // Navigate back to dashboard after successful launch
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Error launching election:', err);
      setError(err.message || 'Failed to launch election. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  // Function to end an election
  const handleEndElection = async () => {
    try {
      setIsLaunching(true);
      setError('');
      
      // Send request to backend API to update election status to 'ended'
      const response = await api.put(`/elections/${id}/status`, { status: 'ended' });
      
      if (response.data) {
        console.log('Election ended successfully:', response.data);
        
        // Update the local state with the updated election data
        setElection(prev => ({
          ...prev,
          status: 'ended'
        }));
      }
    } catch (err) {
      console.error('Error ending election:', err);
      setError(err.message || 'Failed to end election. Please try again.');
    } finally {
      setIsLaunching(false);
    }
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

        <div className="launch-container">
          <div className="launch-header">
  <h1 className="launch-title">Launch Election</h1>
  <div className={`launch-status ${
    election.status === 'live' ? 'live' : 
    election.status === 'ended' ? 'ended' : 
    election.status === 'scheduled' ? 'scheduled' : 'draft'}`}>
    {election.status || 'draft'}
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
            {error && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px' }}>
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Current Status:</strong> {election.status || 'draft'}</p>
              <p>Change the status of your election to launch it or end it.</p>
            </div>
            
            {election.status !== 'live' && election.status !== 'ended' ? (
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button 
                  className="launch-btn"
                  onClick={handleLaunch}
                  disabled={isLaunching || !election.title || !election.startDate || !election.endDate || !election.questions?.length || !election.voters?.length}
                  style={{ background: '#28a745', color: 'white', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  {isLaunching ? 'Launching...' : 'Launch Election'}
                </button>
                
                <button 
                  className="launch-btn"
                  onClick={() => api.put(`/elections/${id}/status`, { status: 'scheduled' })
                    .then(response => {
                      setElection(prev => ({ ...prev, status: 'scheduled' }));
                    })
                    .catch(err => {
                      setError(err.message || 'Failed to schedule election');
                    })}
                  disabled={isLaunching || !election.title || !election.startDate || !election.endDate || !election.questions?.length || !election.voters?.length}
                  style={{ background: '#ffc107', color: '#212529', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  Schedule Election
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                {election.status === 'live' && (
                  <>
                    <div className="launch-success" style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                      <span className="success-icon" style={{ color: '#28a745', marginRight: '8px' }}>✓</span>
                      <span>Election is live</span>
                    </div>
                    
                    <button 
                      onClick={handleEndElection}
                      disabled={isLaunching}
                      style={{ background: '#dc3545', color: 'white', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      {isLaunching ? 'Ending...' : 'End Election'}
                    </button>
                  </>
                )}
                
                {election.status === 'ended' && (
                  <div className="launch-success" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="success-icon" style={{ color: '#dc3545', marginRight: '8px' }}>✓</span>
                    <span>Election has ended</span>
                  </div>
                )}
                
                {election.status === 'scheduled' && (
                  <>
                    <div className="launch-success" style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                      <span className="success-icon" style={{ color: '#ffc107', marginRight: '8px' }}>✓</span>
                      <span>Election is scheduled</span>
                    </div>
                    
                    <button 
                      onClick={handleLaunch}
                      disabled={isLaunching}
                      style={{ background: '#28a745', color: 'white', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      {isLaunching ? 'Launching...' : 'Launch Now'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionLaunch; 
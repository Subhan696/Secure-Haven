import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Joyride, { STATUS } from 'react-joyride';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allElections, setAllElections] = useState([]);
  const navigate = useNavigate();
  const { currentUser, onboardingTour, setOnboardingTour } = useContext(AuthContext);

  const [dashboardSteps] = useState([
    {
      target: '.dashboard-welcome',
      content: "Welcome to your dashboard! This is your central hub for managing all your elections.",
      disableBeacon: true,
    },
    {
      target: '.create-election-button',
      content: "Ready to get started? Click here to create your very first election. The tour will continue on the next page.",
    }
  ]);

  const handleDashboardTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // When the first part of the tour is done, set the state for the next part and navigate.
      setOnboardingTour('wizard');
      navigate('/dashboard/create-election-wizard');
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.email) {
      setEmail(currentUser.email);
    }
    
    const fetchElections = async () => {
      try {
        setLoading(true);
        const response = await api.get('/elections');
        
        if (response.data && response.data.elections) {
          const userElections = response.data.elections;
          setAllElections(userElections);

          const hasCompletedTour = localStorage.getItem('hasCompletedOnboardingTour') === 'true';
          if (userElections.length === 0) {
            setOnboardingTour('dashboard');
          } else if (userElections.length === 1 && userElections[0].status === 'draft') {
            setOnboardingTour('dashboard-launch');
          }

        } else {
          setAllElections([]);
          setOnboardingTour('dashboard');
        }
        setError('');
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
        setAllElections([]);
        setOnboardingTour('dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [currentUser, navigate, setOnboardingTour]);

  // Filter logic
  const filteredElections = allElections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Joyride for first election launch
  const hasCompletedOnboardingTour = localStorage.getItem('hasCompletedOnboardingTour') === 'true';
  const showLaunchTour = onboardingTour === 'dashboard-launch' && filteredElections.length === 1;
  const launchTourSteps = [
    {
      target: '.dashboard-view-btn',
      content: 'Click here to open your new election and launch it!',
      disableBeacon: true,
      placement: 'bottom',
    },
  ];
  const handleLaunchTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setOnboardingTour('');
      localStorage.setItem('hasCompletedOnboardingTour', 'true');
    }
  };

  // Joyride for first election creation (before any elections exist)
  const showCreateTour = onboardingTour === 'dashboard' && allElections.length === 0;
  const createTourSteps = [
    {
      target: '.create-election-btn',
      content: 'Click here to create your first election!',
      disableBeacon: true,
      placement: 'bottom',
    },
  ];
  const handleCreateTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setOnboardingTour('');
    }
  };

  // Debug logs for onboarding tour issues
  console.log('allElections:', allElections);
  console.log('onboardingTour:', onboardingTour);
  console.log('hasCompletedOnboardingTour:', hasCompletedOnboardingTour);

  return (
    <div className="dashboard-container">
      <Joyride 
        steps={dashboardSteps}
        run={onboardingTour === 'dashboard'}
        callback={handleDashboardTourCallback}
        continuous
        showProgress
        showSkipButton
        styles={{ options: { primaryColor: '#4a90e2', zIndex: 10000 } }}
      />
      {showLaunchTour && (
        <Joyride
          steps={launchTourSteps}
          run={true}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose={true}
          spotlightClicks={true}
          callback={handleLaunchTourCallback}
          styles={{ options: { primaryColor: '#4a90e2', zIndex: 10000 } }}
        />
      )}
      {showCreateTour && (
        <Joyride
          steps={createTourSteps}
          run={true}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose={true}
          spotlightClicks={true}
          callback={handleCreateTourCallback}
          styles={{ options: { primaryColor: '#4a90e2', zIndex: 10000 } }}
        />
      )}
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">Dashboard</h1>
        <div className="user-info">
          <span className="user-email">{email}</span>
        </div>
      </div>

      <Link to="/dashboard/create-election-wizard" className="create-election-btn create-election-button">
        Create New Election
      </Link>

      <div className="dashboard-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {/* Display error message if there is one */}
      {error && <div className="error-message">{error}</div>}

      {/* Show loading indicator */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading elections...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-list">
            {filteredElections.length === 0 ? (
              <div className="no-elections">
                <p>No elections found. Create a new election to get started.</p>
              </div>
            ) : (
              filteredElections.map((election, idx) => (
                <div className="election-card" key={election._id}>
                  <div className="election-card-header">
                    <h3>{election.title}</h3>
                    <div className={`election-status ${election.status?.toLowerCase()}`}>
                      {election.status}
                    </div>
                  </div>
                  <div className="election-card-details">
                    <p>Start: {new Date(election.startDate).toLocaleString()}</p>
                    <p>End: {new Date(election.endDate).toLocaleString()}</p>
                    <p>Questions: {election.questions?.length || 0}</p>
                    <p>Voters: {election.voters?.length || 0}</p>
                  </div>

                  {/* Mini Results Section for Dashboard */}
                  <div className="election-mini-results">
                    <h4 className="mini-results-title">Current Results</h4>
                    {election.questions?.length > 0 ? (
                      election.questions.map(question => (
                        <div key={question._id} className="mini-question-results">
                          <p className="mini-question-text">{question.text}</p>
                          <div className="mini-options-list">
                            {question.options.map(option => {
                              const voteCount = option.voteCount || 0;
                              const totalVotesForQuestion = question.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
                              const percentage = totalVotesForQuestion > 0 ? (voteCount / totalVotesForQuestion) * 100 : 0;
                              const isWinning = Math.max(...question.options.map(opt => opt.voteCount || 0)) === voteCount && voteCount > 0;
                              return (
                                <div key={option._id} className={`mini-option-item ${isWinning ? 'winning' : ''}`}>
                                  <span className="mini-option-text">{option.text}</span>
                                  <span className="mini-option-votes">{voteCount} ({percentage.toFixed(1)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-results-message">No questions available for results.</p>
                    )}
                  </div>

                  <div className="election-card-actions">
                    <Link
                      to={`/dashboard/elections/${election._id}/overview`}
                      className="dashboard-view-btn"
                      onClick={() => {
                        if (onboardingTour === 'dashboard-launch' && filteredElections.length === 1) {
                          setOnboardingTour('');
                        }
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="dashboard-count">
            Showing {filteredElections.length} of {allElections.length} Election{allElections.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
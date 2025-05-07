import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionOverview.css';

const colorCards = [
  { label: 'Voters', color: '#ff7a00', icon: '👥', key: 'voters' },
  { label: 'Ballot Questions', color: '#f5007b', icon: '❓', key: 'questions' },
  { label: 'Options', color: '#4b23c5', icon: '📋', key: 'options' },
];

const ElectionOverview = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      setElection(found);
    }
  }, [id]);

  if (!election) return <div className="loading">Election not found</div>;

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="overview-title">Overview</h2>
        <div className="overview-content">
          <div className="overview-main">
            <div className="overview-row">
              <div className="overview-card">
                <div className="overview-card-label">Start Date</div>
                <div className="overview-card-value">{election.startDate ? new Date(election.startDate).toLocaleString() : ''}</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-label">End Date</div>
                <div className="overview-card-value">{election.endDate ? new Date(election.endDate).toLocaleString() : ''}</div>
              </div>
            </div>
          </div>
          <div className="overview-side">
            {colorCards.map(card => (
              <div
                key={card.label}
                className="overview-summary-card"
                style={{ background: card.color }}
              >
                <span className="overview-summary-icon">{card.icon}</span>
                <span className="overview-summary-count">
                  {card.key === 'voters' && (election.voters ? election.voters.length : 0)}
                  {card.key === 'questions' && (election.questions ? election.questions.length : 0)}
                  {card.key === 'options' && (election.questions ? election.questions.reduce((acc, q) => acc + (q.options ? q.options.length : 0), 0) : 0)}
                </span>
                <span className="overview-summary-label">{card.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionOverview; 
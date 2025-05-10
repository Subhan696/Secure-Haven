import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import './ElectionSidebar.css';

const navItems = [
  { label: 'Overview', path: 'overview' },
  { label: 'Settings', path: 'settings' },
  { label: 'Ballot', path: 'ballot' },
  { label: 'Voters', path: 'voters' },
  { label: 'Preview', path: 'preview' },
  { label: 'Launch', path: 'launch' },
];

const ElectionSidebar = ({ open, setOpen }) => {
  const { id } = useParams();
  const [electionTitle, setElectionTitle] = useState('Election');
  
  // Load election title from localStorage whenever it might change
  useEffect(() => {
    const loadElectionTitle = () => {
      const stored = localStorage.getItem('elections');
      if (stored) {
        const found = JSON.parse(stored).find(e => String(e.id) === String(id));
        if (found && found.title) {
          setElectionTitle(found.title);
        }
      }
    };
    
    // Load initially
    loadElectionTitle();
    
    // Add event listener for storage changes
    window.addEventListener('storage', loadElectionTitle);
    
    // Custom event listener for direct updates
    const handleElectionUpdate = () => loadElectionTitle();
    window.addEventListener('electionUpdated', handleElectionUpdate);
    
    return () => {
      window.removeEventListener('storage', loadElectionTitle);
      window.removeEventListener('electionUpdated', handleElectionUpdate);
    };
  }, [id]);
  return (
    <nav className={`election-sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">{electionTitle}</span>
        <button className="sidebar-close" onClick={() => setOpen(false)}>&times;</button>
      </div>
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={`/dashboard/elections/${id}/${item.path}`}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ElectionSidebar; 
import React from 'react';
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
  return (
    <nav className={`election-sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Election</span>
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
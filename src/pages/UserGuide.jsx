import React from 'react';
import './UserGuide.css';

const UserGuide = () => {
  return (
    <div className="user-guide-container">
      <div className="guide-header">
        <h1>Complete User Guide</h1>
        <p>Everything you need to know about using Secure Haven for your elections</p>
      </div>

      <div className="guide-content">
        <section className="guide-section">
          <h2>Getting Started</h2>
          <div className="guide-card">
            <h3>1. Account Setup</h3>
            <ul>
              <li>Sign up for a Secure Haven account</li>
              <li>Verify your email address</li>
              <li>Complete your organization profile</li>
            </ul>
          </div>
        </section>

        <section className="guide-section">
          <h2>Creating an Election</h2>
          <div className="guide-card">
            <h3>1. Basic Information</h3>
            <ul>
              <li>Enter election title and description</li>
              <li>Set election visibility settings</li>
              <li>Configure election dates</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>2. Ballot Configuration</h3>
            <ul>
              <li>Add ballot questions</li>
              <li>Configure answer options</li>
              <li>Set up voting preferences</li>
            </ul>
          </div>
        </section>

        <section className="guide-section">
          <h2>Managing Voters</h2>
          <div className="guide-card">
            <h3>1. Voter Registration</h3>
            <ul>
              <li>Add voters manually</li>
              <li>Send email invitations</li>
              <li>Manage voter access</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>2. Voter Authentication</h3>
            <ul>
              <li>Email verification process</li>
              <li>Voter key distribution</li>
              <li>Access control settings</li>
            </ul>
          </div>
        </section>

        <section className="guide-section">
          <h2>Election Timeline</h2>
          <div className="guide-card">
            <h3>1. Scheduling</h3>
            <ul>
              <li>Set start and end dates</li>
              <li>Configure time zones</li>
              <li>Schedule reminders</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>2. Launch Process</h3>
            <ul>
              <li>Pre-launch checklist</li>
              <li>System verification</li>
              <li>Launch confirmation</li>
            </ul>
          </div>
        </section>

        <section className="guide-section">
          <h2>Monitoring & Results</h2>
          <div className="guide-card">
            <h3>1. Real-time Monitoring</h3>
            <ul>
              <li>Voter participation tracking</li>
              <li>Activity logs</li>
              <li>Security alerts</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>2. Results Management</h3>
            <ul>
              <li>Result calculation methods</li>
              <li>Export options</li>
              <li>Result sharing settings</li>
            </ul>
          </div>
        </section>

        <section className="guide-section">
          <h2>Security Features</h2>
          <div className="guide-card">
            <h3>1. Data Protection</h3>
            <ul>
              <li>End-to-end encryption</li>
              <li>Secure data storage</li>
              <li>Backup systems</li>
            </ul>
          </div>
          <div className="guide-card">
            <h3>2. Fraud Prevention</h3>
            <ul>
              <li>IP tracking</li>
              <li>Duplicate vote detection</li>
              <li>Activity monitoring</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserGuide; 
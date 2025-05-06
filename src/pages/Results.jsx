import React from 'react';
import { useParams } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const { electionId } = useParams();

  // Mock data for demonstration
  const electionResults = {
    title: "Student Council Election 2024",
    totalVotes: 150,
    candidates: [
      { id: 1, name: "John Smith", votes: 75, percentage: 50 },
      { id: 2, name: "Sarah Johnson", votes: 45, percentage: 30 },
      { id: 3, name: "Michael Chen", votes: 30, percentage: 20 }
    ],
    status: "Completed",
    endDate: "2024-03-15"
  };

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>{electionResults.title}</h1>
        <div className="election-info">
          <p>Total Votes: {electionResults.totalVotes}</p>
          <p>Status: {electionResults.status}</p>
          <p>End Date: {electionResults.endDate}</p>
        </div>
      </div>

      <div className="results-content">
        <h2>Candidate Results</h2>
        <div className="candidate-results">
          {electionResults.candidates.map(candidate => (
            <div key={candidate.id} className="candidate-result">
              <div className="candidate-info">
                <h3>{candidate.name}</h3>
                <p>{candidate.votes} votes ({candidate.percentage}%)</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${candidate.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="results-footer">
        <button className="download-button">Download Results</button>
        <button className="share-button">Share Results</button>
      </div>
    </div>
  );
};

export default Results; 
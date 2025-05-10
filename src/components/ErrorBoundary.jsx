import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import './ErrorBoundary.css';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops!</h1>
        <h2>{error.status === 404 ? 'Page Not Found' : 'Something went wrong'}</h2>
        <p>
          {error.status === 404
            ? 'The page you are looking for does not exist or has been moved.'
            : 'We encountered an error while processing your request.'}
        </p>
        <div className="error-actions">
          <Link to="/" className="home-link">Go to Home</Link>
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './Pages.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn btn-primary">
        <Home size={18} />
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
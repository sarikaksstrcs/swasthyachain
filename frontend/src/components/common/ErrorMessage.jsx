
import { AlertCircle } from 'lucide-react';
import './Common.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <AlertCircle size={48} className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{message || 'An unexpected error occurred'}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;


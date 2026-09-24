import React from 'react';
import { Sprout } from 'lucide-react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <Sprout className="spinner-icon" size={48} />
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

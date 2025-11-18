import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', overlay = false }) => {
    const spinner = (
        <div className={`loading-spinner loading-spinner-${size}`} role="status" aria-live="polite" aria-busy="true">
            <div className="spinner-border" aria-hidden="true"></div>
            <span className="visually-hidden">Loading content, please wait...</span>
        </div>
    );

    if (overlay) {
        return (
            <div className="loading-spinner-overlay" role="dialog" aria-modal="false" aria-label="Loading">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;

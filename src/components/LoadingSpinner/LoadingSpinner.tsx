import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    isOverlay?: boolean;
    // Shown under the spinner in overlay mode (e.g. export progress)
    label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    isOverlay = false,
    label,
}) => {
    const spinner = (
        <div
            className={`loading-spinner loading-spinner-${size}`}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="spinner-border" aria-hidden="true"></div>
            <span className="visually-hidden">
                Loading content, please wait...
            </span>
        </div>
    );

    if (isOverlay) {
        return (
            <div
                className="loading-spinner-overlay"
                role="dialog"
                aria-modal="false"
                aria-label="Loading"
            >
                <div className="loading-spinner-overlay-content">
                    {spinner}
                    {label && <span className="loading-spinner-label">{label}</span>}
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;

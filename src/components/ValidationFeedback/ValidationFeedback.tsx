import React from "react";
import "./ValidationFeedback.css";

interface ValidationFeedbackProps {
    isValid: boolean;
    message?: string;
    shouldShowValidState?: boolean;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
    isValid,
    message,
    shouldShowValidState = true,
}) => {
    // Don't show anything if valid and shouldShowValidState is false
    if (isValid && !shouldShowValidState) {
        return null;
    }

    return (
        <div className="validation-feedback-container">
            {!isValid && message && (
                <div
                    className="validation-message error"
                    role="alert"
                    aria-live="polite"
                >
                    <i className="bi bi-x-circle-fill" aria-hidden="true"></i>
                    <span>{message}</span>
                </div>
            )}
            {isValid && shouldShowValidState && (
                <div
                    className="validation-message success"
                    role="status"
                    aria-live="polite"
                >
                    <i
                        className="bi bi-check-circle-fill"
                        aria-hidden="true"
                    ></i>
                    <span className="visually-hidden">Input is valid</span>
                </div>
            )}
        </div>
    );
};

export default ValidationFeedback;

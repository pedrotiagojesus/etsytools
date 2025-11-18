import { useState } from 'react';
import './Toast.css';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // Match fade-out animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  };

  return (
    <div
      className={`toast-item toast-${type} ${isExiting ? 'toast-exit' : ''}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast-content">
        <i className={`bi ${getIcon()} toast-icon`} aria-hidden="true"></i>
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label={`Close ${type} notification: ${message}`}
        type="button"
      >
        <i className="bi bi-x" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default Toast;

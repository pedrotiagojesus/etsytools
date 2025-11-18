import { useContext } from 'react';
import ToastContext from '../contexts/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { addToast, removeToast, toasts } = context;

  // Convenient methods for showing different types of toasts
  const showSuccess = (message: string, duration?: number) => {
    addToast(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    addToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    addToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    addToast(message, 'info', duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

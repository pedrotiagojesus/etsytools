import { createContext, useContext } from "react";

export interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration: number;
}

export interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: Toast["type"], duration?: number) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
    undefined,
);

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    const { addToast, removeToast, toasts } = context;

    // Convenient methods for showing different types of toasts
    const showSuccess = (message: string, duration?: number) => {
        addToast(message, "success", duration);
    };

    const showError = (message: string, duration?: number) => {
        addToast(message, "error", duration);
    };

    const showWarning = (message: string, duration?: number) => {
        addToast(message, "warning", duration);
    };

    const showInfo = (message: string, duration?: number) => {
        addToast(message, "info", duration);
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

import { useCallback, useContext } from "react";
import ToastContext from "@contexts/ToastContext";
import type { Toast } from "@contexts/ToastContext";

type ShowToast = (message: string, duration?: number) => void;

interface UseToastResult {
    toasts: Toast[];
    addToast: (message: string, type: Toast["type"], duration?: number) => void;
    removeToast: (id: string) => void;
    showSuccess: ShowToast;
    showError: ShowToast;
    showWarning: ShowToast;
    showInfo: ShowToast;
}

export const useToast = (): UseToastResult => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    const { addToast, removeToast, toasts } = context;

    // Convenient methods for showing different types of toasts
    const showSuccess = useCallback(
        (message: string, duration?: number) => {
            addToast(message, "success", duration);
        },
        [addToast],
    );

    const showError = useCallback(
        (message: string, duration?: number) => {
            addToast(message, "error", duration);
        },
        [addToast],
    );

    const showWarning = useCallback(
        (message: string, duration?: number) => {
            addToast(message, "warning", duration);
        },
        [addToast],
    );

    const showInfo = useCallback(
        (message: string, duration?: number) => {
            addToast(message, "info", duration);
        },
        [addToast],
    );

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

import Toast from "./Toast";
import type { Toast as ToastItem } from "@contexts/ToastContext";
import "./ToastContainer.css";

interface ToastContainerProps {
    toasts: ToastItem[];
    onRemoveToast: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
    // Limit to maximum 3 visible toasts
    const visibleToasts = toasts.slice(0, 3);

    // Determine if we have any error toasts (use assertive for errors)
    const hasErrors = visibleToasts.some((toast) => toast.type === "error");

    return (
        <div
            className="toast-container"
            role="region"
            aria-live={hasErrors ? "assertive" : "polite"}
            aria-label="Notifications"
            aria-relevant="additions text"
        >
            {visibleToasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={onRemoveToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;

// CSS
import "./EndpointFeedback.css";

type StatusType = "success" | "error" | "warning" | "info"  | "danger" | null;
type EndpointFeedbackProps = {
    status: StatusType;
    description: string | null;
};

const EndpointFeedback = ({ status, description }: EndpointFeedbackProps) => {
    if (!status || !description) return null;

    return (
        <div className={`alert alert-${status} mt-3`} role="alert">
            {description}
        </div>
    );
};

export default EndpointFeedback;

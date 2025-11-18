interface ToolbarProps {
    guideLine: boolean;
    setGuideLine: (v: boolean) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    center: () => void;
}

const MockupToolbar: React.FC<ToolbarProps> = ({ guideLine, setGuideLine, zoomIn, zoomOut, center }) => {
    return (
        <div className="tools">
            <button
                className="btn btn-primary"
                onClick={() => zoomIn()}
                aria-label="Zoom in"
                title="Zoom in"
            >
                <i className="bi bi-plus" aria-hidden="true"></i>
            </button>
            <button
                className="btn btn-primary"
                onClick={() => zoomOut()}
                aria-label="Zoom out"
                title="Zoom out"
            >
                <i className="bi bi-dash" aria-hidden="true"></i>
            </button>
            <button
                className="btn btn-primary"
                onClick={() => center()}
                aria-label="Center canvas"
                title="Center canvas"
            >
                <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
            </button>
            <button
                className={`btn ${guideLine ? "btn-success" : "btn-primary"}`}
                onClick={() => setGuideLine(!guideLine)}
                aria-label={guideLine ? "Hide guidelines" : "Show guidelines"}
                aria-pressed={guideLine}
                title={guideLine ? "Hide guidelines" : "Show guidelines"}
            >
                <i className="bi bi-rulers" aria-hidden="true"></i>
            </button>
        </div>
    );
};

export default MockupToolbar;

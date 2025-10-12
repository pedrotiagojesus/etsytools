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
            <button className="btn btn-primary" onClick={() => zoomIn()}>
                <i className="bi bi-plus"></i>
            </button>
            <button className="btn btn-primary" onClick={() => zoomOut()}>
                <i className="bi bi-dash"></i>
            </button>
            <button className="btn btn-primary" onClick={() => center()}>
                <i className="bi bi-arrow-clockwise"></i>
            </button>
            <button
                className={`btn ${guideLine ? "btn-success" : "btn-primary"}`}
                onClick={() => setGuideLine(!guideLine)}
            >
                <i className="bi bi-rulers"></i>
            </button>
        </div>
    );
};

export default MockupToolbar;

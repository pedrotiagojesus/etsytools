import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";

interface MockupEditorProps {
    mode: "html" | "css";
    preview: string;
    setPreview: (v: string) => void;
}

const MockupEditor: React.FC<MockupEditorProps> = ({ mode, preview, setPreview }) => {
    return (
        <AceEditor
            mode={mode}
            theme="monokai"
            onChange={setPreview}
            fontSize={14}
            value={preview}
            width="100%"
            height="100%"
            setOptions={{ showLineNumbers: true, tabSize: 4, useWorker: false }}
        />
    );
};

export default MockupEditor;

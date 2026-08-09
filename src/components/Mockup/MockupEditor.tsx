import { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";

interface MockupEditorProps {
    mode: "html" | "css";
    preview: string;
    setPreview: (v: string) => void;
    debounceMs?: number;
}

const MockupEditor: React.FC<MockupEditorProps> = ({
    mode,
    preview,
    setPreview,
    debounceMs = 300,
}) => {
    const [localValue, setLocalValue] = useState(preview);
    const debounceTimer = useRef<number | null>(null);
    const isInternalChange = useRef(false);

    // Sincroniza o valor local quando o preview muda por fora
    // (ex: trocar de template, upload de imagem, seleção de padrão)
    useEffect(() => {
        if (!isInternalChange.current) {
            setLocalValue(preview);
        }
        isInternalChange.current = false;
    }, [preview]);

    const handleChange = (value: string) => {
        setLocalValue(value); // feedback instantâneo no editor

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = window.setTimeout(() => {
            isInternalChange.current = true;
            setPreview(value); // só aqui reprocessa DOMParser/preview
        }, debounceMs);
    };

    // Garante que a última alteração não se perde ao trocar de aba/desmontar
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                isInternalChange.current = true;
                setPreview(localValue);
            }
        };
    }, []);

    return (
        <AceEditor
            mode={mode}
            theme="monokai"
            onChange={handleChange}
            fontSize={14}
            value={localValue}
            width="100%"
            height="100%"
            setOptions={{ showLineNumbers: true, tabSize: 4, useWorker: false }}
        />
    );
};

export default MockupEditor;

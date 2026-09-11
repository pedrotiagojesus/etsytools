import { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";

interface MockupEditorProps {
    mode: "html" | "css";
    preview: string;
    onChange: (v: string) => void;
    debounceMs?: number;
}

const MockupEditor: React.FC<MockupEditorProps> = ({
    mode,
    preview,
    onChange,
    debounceMs = 300,
}) => {
    const [localValue, setLocalValue] = useState(preview);
    const debounceTimer = useRef<number | null>(null);
    const isInternalChange = useRef(false);

    // Refs para o cleanup de desmontagem (abaixo) ter sempre acesso ao valor
    // e ao onChange mais recentes, em vez de ficar preso aos da primeira
    // renderização (o efeito só corre no mount/unmount, de propósito).
    const localValueRef = useRef(localValue);
    const onChangeRef = useRef(onChange);
    localValueRef.current = localValue;
    onChangeRef.current = onChange;

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

        // Fecha sobre o `onChange` desta renderização (o alvo — ex: o slide
        // ativo — no momento em que se escreveu), não a ref sempre
        // atualizada usada no cleanup abaixo. Sem isto, trocar de slide
        // dentro da janela do debounce faz a edição escrever no slide
        // errado (o que ficou ativo entretanto), não naquele onde foi feita.
        const targetOnChange = onChange;

        debounceTimer.current = window.setTimeout(() => {
            isInternalChange.current = true;
            targetOnChange(value); // só aqui reprocessa DOMParser/preview
        }, debounceMs);
    };

    // Garante que a última alteração não se perde ao trocar de aba/desmontar
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                isInternalChange.current = true;
                onChangeRef.current(localValueRef.current);
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

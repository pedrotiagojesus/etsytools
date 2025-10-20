import { useEffect, useState } from "react";
import injectPatternStyle from "../../utils/injectPatternStyle";
import ModalPatterns from "./ModalPatterns";

interface Pattern {
    name: string;
    css: string;
}

interface MockupPatternsProps {
    previewCss: string;
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    patternsInput: { name: string }[];
    setPatternsInput: (patterns: { name: string }[]) => void;
    patterns: Pattern[];
}

const MockupPatterns: React.FC<MockupPatternsProps> = ({
    previewCss,
    previewHtml,
    setPreviewHtml,
    patternsInput,
    setPatternsInput,
    patterns,
}) => {
    const [activePatterns, setActivePatterns] = useState<string[]>([]);
    const [patternCssList, setPatternCssList] = useState<string[]>([]);
    const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);

    // Detecta padrões existentes no HTML e inicializa inputs
    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const ptns = divs.map((div, i) => ({
            name: div.getAttribute("data-title") ?? `Padrão ${i + 1}`,
        }));
        setPatternsInput(ptns);

        const currentActive = divs.map((div) => {
            const patternClass = Array.from(div.classList).find((cls) => cls.startsWith("pattern-"));
            return patternClass ? patternClass.replace("pattern-", "") : "";
        });

        setActivePatterns(currentActive);
        setPatternCssList((prev) => {
            return prev.length === 0 ? divs.map(() => "") : prev;
        });
    }, [previewHtml]);

    // Injeção dinâmica de CSS customizado por instância
    useEffect(() => {
        patternCssList.forEach((cssContent, index) => {
            if (!cssContent) return;

            const styleId = `pattern-style-${index}`;
            injectPatternStyle(cssContent, styleId);
        });
    }, [patternCssList]);

    const handlePatternRemove = (index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const targetDiv = divs[index];
        if (targetDiv) {
            // Remove qualquer classe pattern-*
            targetDiv.classList.forEach((cls) => {
                if (cls.startsWith("pattern-")) {
                    targetDiv.classList.remove(cls);
                }
            });

            // Atualiza HTML do preview
            setPreviewHtml(doc.documentElement.innerHTML);

            // Limpa estado
            setActivePatterns((prev) => {
                const newState = [...prev];
                newState[index] = "";
                return newState;
            });

            setPatternCssList((prev) => {
                const newState = [...prev];
                newState[index] = "";
                return newState;
            });

            // Remove style do head
            const styleEl = document.getElementById(`pattern-style-${index}`);
            if (styleEl) {
                styleEl.remove();
            }
        }
    };

    return (
        <div className="pattern-slider">
            {patternsInput.length ? (
                <>
                    {patternsInput.map((data, patternIndex) => (
                        <div className="pattern-block" key={patternIndex}>
                            <h5>{data.name}</h5>
                            <div className="btn-list">
                                <button
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modal-patterns"
                                    onClick={() => setCurrentEditingIndex(patternIndex)}
                                >
                                    Selecionar padrão
                                </button>
                                <button
                                    className={"btn btn-danger"}
                                    disabled={!activePatterns[patternIndex]}
                                    onClick={() => handlePatternRemove(patternIndex)}
                                >
                                    Remover padrão
                                </button>
                            </div>
                        </div>
                    ))}
                    <ModalPatterns
                        previewCss={previewCss}
                        previewHtml={previewHtml}
                        setPreviewHtml={setPreviewHtml}
                        patterns={patterns}
                        editingIndex={currentEditingIndex}
                    />
                </>
            ) : (
                <p className="text-muted">Nenhum padrão encontrado.</p>
            )}
        </div>
    );
};

export default MockupPatterns;

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

    // Detecta padrões no HTML e inicializa estado
    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        // Inicializa lista de inputs
        const ptns = divs.map((div, i) => ({
            name: div.getAttribute("data-title") ?? `Padrão ${i + 1}`,
        }));
        setPatternsInput(ptns);

        // Inicializa arrays de estado
        setActivePatterns((prev) => (prev.length ? prev : divs.map(() => "")));
        setPatternCssList((prev) => (prev.length ? prev : divs.map(() => "")));
    }, [previewHtml, setPatternsInput]);

    // Injeção de CSS dinâmico
    useEffect(() => {
        patternCssList.forEach((css, idx) => {
            const id = `pattern-style-${idx}`;
            if (!css) {
                const existing = document.getElementById(id);
                if (existing) existing.remove();
                return;
            }
            injectPatternStyle(css, id);
        });
    }, [patternCssList]);

    const handlePatternRemove = (index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];
        const targetDiv = divs[index];
        if (!targetDiv) return;

        Array.from(targetDiv.classList).forEach((cls) => {
            if (cls.startsWith("pattern-")) targetDiv.classList.remove(cls);
        });

        setPreviewHtml(doc.documentElement.innerHTML);

        setActivePatterns((prev) => {
            const n = [...prev];
            n[index] = "";
            return n;
        });

        setPatternCssList((prev) => {
            const n = [...prev];
            n[index] = "";
            return n;
        });

        const styleEl = document.getElementById(`pattern-style-${index}`);
        if (styleEl) styleEl.remove();
    };

    return (
        <>
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
                                    className="btn btn-danger"
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
                        activePatterns={activePatterns}
                        setActivePatterns={setActivePatterns}
                        patternCssList={patternCssList}
                        setPatternCssList={setPatternCssList}
                    />
                </>
            ) : (
                <p className="text-muted">Nenhum padrão encontrado.</p>
            )}
        </>
    );
};

export default MockupPatterns;

import { useEffect } from "react";
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
    // Elevado para o componente pai para poder ser incluído no export/import
    activePatterns: string[];
    setActivePatterns: (patterns: string[]) => void;
    patternCssList: string[];
    setPatternCssList: (list: string[]) => void;
    currentEditingIndex: number | null;
    setCurrentEditingIndex: (index: number | null) => void;
}

const MockupPatterns: React.FC<MockupPatternsProps> = ({
    previewCss,
    previewHtml,
    setPreviewHtml,
    patternsInput,
    setPatternsInput,
    patterns,
    activePatterns,
    setActivePatterns,
    patternCssList,
    setPatternCssList,
    currentEditingIndex,
    setCurrentEditingIndex,
}) => {
    // Detecta padrões no HTML e inicializa estado
    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const ptns = divs.map((div, i) => ({
            name: div.getAttribute("data-title") ?? `Padrão ${i + 1}`,
        }));
        setPatternsInput(ptns);

        setActivePatterns(activePatterns.length ? activePatterns : divs.map(() => ""));
        setPatternCssList(patternCssList.length ? patternCssList : divs.map(() => ""));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewHtml, setPatternsInput]);

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

        const n = [...activePatterns];
        n[index] = "";
        setActivePatterns(n);

        const c = [...patternCssList];
        c[index] = "";
        setPatternCssList(c);

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
import { useEffect, type Dispatch, type SetStateAction } from "react";
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
    activePatterns: string[];
    setActivePatterns: Dispatch<SetStateAction<string[]>>;
    patternCssList: string[];
    setPatternCssList: Dispatch<SetStateAction<string[]>>;
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
    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(
            doc.querySelectorAll("div[data-pattern]"),
        ) as HTMLDivElement[];

        const ptns = divs.map((div, i) => ({
            name: div.getAttribute("data-title") ?? `Padrão ${i + 1}`,
        }));
        setPatternsInput(ptns);

        setActivePatterns((prev) => (prev.length ? prev : divs.map(() => "")));
        setPatternCssList((prev) => (prev.length ? prev : divs.map(() => "")));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewHtml, setPatternsInput]);

    const handlePatternRemove = (index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(
            doc.querySelectorAll("div[data-pattern]"),
        ) as HTMLDivElement[];
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
                    {patternsInput.map((data, patternIndex) => {
                        const hasActivePattern = Boolean(
                            activePatterns[patternIndex],
                        );
                        const statusId = `pattern-status-${patternIndex}`;

                        return (
                            <div className="pattern-block" key={patternIndex}>
                                <h5 id={`pattern-label-${patternIndex}`}>
                                    {data.name}
                                </h5>
                                <p id={statusId} className="visually-hidden">
                                    {hasActivePattern
                                        ? `Padrão ativo: ${activePatterns[patternIndex]}`
                                        : "Nenhum padrão selecionado"}
                                </p>
                                <div className="btn-list">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modal-patterns"
                                        onClick={() =>
                                            setCurrentEditingIndex(patternIndex)
                                        }
                                        aria-label={`Selecionar padrão para ${data.name}`}
                                        aria-describedby={statusId}
                                    >
                                        Selecionar padrão
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={!hasActivePattern}
                                        onClick={() =>
                                            handlePatternRemove(patternIndex)
                                        }
                                        aria-label={`Remover padrão de ${data.name}`}
                                    >
                                        Remover padrão
                                    </button>
                                </div>
                            </div>
                        );
                    })}

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

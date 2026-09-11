import { useEffect } from "react";
import ModalPatterns from "./ModalPatterns";
import injectPatternStyle from "@utils/injectPatternStyle";
import type { MockupEditorState } from "@hooks/useMockupEditor";

interface MockupPatternsProps {
    editor: MockupEditorState;
}

const MockupPatterns: React.FC<MockupPatternsProps> = ({ editor }) => {
    const {
        previewHtml,
        updateHtml: setPreviewHtml,
        patternsInput,
        setPatternsInput,
        loadPatterns,
        activePatterns,
        setActivePatterns,
        patternCssList,
        setPatternCssList,
        currentEditingIndex,
        setCurrentEditingIndex,
    } = editor;

    // O catálogo de padrões só é carregado quando esta tab é aberta pela
    // primeira vez (não no mount da página Mockup) — evita ~200 pedidos
    // de rede para quem nunca chega a usar padrões. Escuta o evento do
    // Bootstrap (não só o onClick do botão) para cobrir também a troca de
    // tab por teclado.
    useEffect(() => {
        const trigger = document.getElementById("pattern-tab-trigger");
        const handleShown = () => loadPatterns();
        trigger?.addEventListener("shown.bs.tab", handleShown);
        return () => trigger?.removeEventListener("shown.bs.tab", handleShown);
    }, [loadPatterns]);

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

    // Os <style id="pattern-style-N"> injetados são globais ao document,
    // mas patternCssList é por slide — ao trocar de slide ativo (ou depois
    // de importar uma configuração), previewHtml muda e é preciso
    // reinjetar os estilos desse slide, ou o preview mostraria os padrões
    // do slide anterior (ou nenhum) até se voltar a editar um padrão.
    // patternCssList não entra nas deps de propósito: muda no mesmo
    // "commit" que previewHtml quando se troca de slide (ambos vêm do
    // mesmo slide ativo), por isso já está atualizado quando este efeito
    // corre a seguir a uma troca de slide.
    useEffect(() => {
        patternCssList.forEach((css, index) => {
            if (css) injectPatternStyle(css, `pattern-style-${index}`);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewHtml]);

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

                    <ModalPatterns editor={editor} editingIndex={currentEditingIndex} />
                </>
            ) : (
                <p className="text-muted">Nenhum padrão encontrado.</p>
            )}
        </>
    );
};

export default MockupPatterns;

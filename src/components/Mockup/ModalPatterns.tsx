import { useEffect, useState, lazy, Suspense } from "react";
import MockupEditor from "./MockupEditor";
import injectPatternStyle from "../../utils/injectPatternStyle";

// Lazy load do MockupPreview
const MockupPreview = lazy(() => import("./MockupPreview"));

interface Pattern {
    name: string;
    css: string;
}

interface ModalPatternsProps {
    previewCss: string;
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    patterns: Pattern[];
    editingIndex: number | null;
}

const ModalPatterns = ({ previewCss, previewHtml, setPreviewHtml, patterns, editingIndex }: ModalPatternsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatternCss, setSelectedPatternCss] = useState<string>("");
    const [selectedPatternName, setSelectedPatternName] = useState<string>("");

    useEffect(() => {
        const modalElement = document.getElementById("modal-patterns");

        const handleShown = () => setIsModalOpen(true);
        const handleHidden = () => setIsModalOpen(false);

        modalElement?.addEventListener("shown.bs.modal", handleShown);
        modalElement?.addEventListener("hidden.bs.modal", handleHidden);

        return () => {
            modalElement?.removeEventListener("shown.bs.modal", handleShown);
            modalElement?.removeEventListener("hidden.bs.modal", handleHidden);
        };
    }, []);

    return (
        <div className="modal" id="modal-patterns">
            <div className="modal-dialog modal-fullscreen">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Selecionar Padrão</h1>
                    </div>
                    <div className="modal-body">
                        <div className="row main-row">
                            <div className="col-7 left-side">
                                {isModalOpen && (
                                    <Suspense fallback={<div>Carregando preview...</div>}>
                                        <MockupPreview
                                            previewId="modal-pattern-preview"
                                            previewDisplayId="modal-pattern-display"
                                            previewHtml={previewHtml}
                                            previewCss={previewCss}
                                        />
                                    </Suspense>
                                )}
                                <div className="pattern-editor">
                                    <MockupEditor
                                        mode="css"
                                        preview={selectedPatternCss}
                                        setPreview={(newCss) => {
                                            setSelectedPatternCss(newCss);

                                            // Aplica dinamicamente no DOM
                                            if (editingIndex !== null) {
                                                injectPatternStyle(newCss, `pattern-style-${editingIndex}`);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-5 right-side">
                                <div className="pattern-list-scroll">
                                    <div className="row pattern-list">
                                        {patterns.map((pattern, index) => (
                                            <div className="col-3" key={index}>
                                                <div
                                                    className={`pattern-preview ${pattern.name}-pattern`}
                                                    onClick={() => {
                                                        if (editingIndex === null) return;

                                                        const selected = patterns.find((p) => p.name === pattern.name);
                                                        if (!selected) return;

                                                        setSelectedPatternName(pattern.name);

                                                        const parser = new DOMParser();
                                                        const doc = parser.parseFromString(previewHtml, "text/html");
                                                        const divs = Array.from(
                                                            doc.querySelectorAll("div[data-pattern]")
                                                        ) as HTMLDivElement[];

                                                        const targetDiv = divs[editingIndex];
                                                        if (targetDiv) {
                                                            // Remove classes antigas
                                                            targetDiv.classList.forEach((cls) => {
                                                                if (cls.startsWith("pattern-")) {
                                                                    targetDiv.classList.remove(cls);
                                                                }
                                                            });

                                                            // Aplica nova classe escopada
                                                            const newClass = `pattern-${editingIndex}`;
                                                            targetDiv.classList.add(newClass);

                                                            // Atualiza o preview com novo HTML
                                                            setPreviewHtml(doc.documentElement.innerHTML);

                                                            // Ajusta o CSS com seletor escopado
                                                            const adjustedCss = selected.css.replace(
                                                                new RegExp(`\\.${pattern.name}-pattern`, "g"),
                                                                `.pattern-${editingIndex}`
                                                            );

                                                            // Atualiza o CSS no estado
                                                            setSelectedPatternCss(adjustedCss);

                                                            // Injeta o CSS escopado no DOM
                                                            injectPatternStyle(
                                                                adjustedCss,
                                                                `pattern-style-${editingIndex}`
                                                            );
                                                        }
                                                    }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPatterns;

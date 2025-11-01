import { useEffect, useState, lazy, Suspense } from "react";
import MockupEditor from "./MockupEditor";
import injectPatternStyle from "../../utils/injectPatternStyle";

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
    activePatterns: string[];
    setActivePatterns: (patterns: string[]) => void;
    patternCssList: string[];
    setPatternCssList: (list: string[]) => void;
}

const ModalPatterns: React.FC<ModalPatternsProps> = ({
    previewCss,
    previewHtml,
    setPreviewHtml,
    patterns,
    editingIndex,
    activePatterns,
    setActivePatterns,
    patternCssList,
    setPatternCssList,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatternName, setSelectedPatternName] = useState<string>("");
    const [selectedPatternCss, setSelectedPatternCss] = useState<string>("");

    // Controla evento de abertura/fecho do modal
    useEffect(() => {
        const modal = document.getElementById("modal-patterns");
        const handleShow = () => setIsModalOpen(true);
        const handleHide = () => setIsModalOpen(false);
        modal?.addEventListener("shown.bs.modal", handleShow);
        modal?.addEventListener("hidden.bs.modal", handleHide);
        return () => {
            modal?.removeEventListener("shown.bs.modal", handleShow);
            modal?.removeEventListener("hidden.bs.modal", handleHide);
        };
    }, []);

    // Sincroniza modal com padrão ativo no pai
    useEffect(() => {
        if (!isModalOpen || editingIndex === null) return;

        const activeName = activePatterns[editingIndex] || "";
        setSelectedPatternName(activeName);

        if (patternCssList[editingIndex]) {
            setSelectedPatternCss(patternCssList[editingIndex]);
        } else if (activeName) {
            const found = patterns.find((p) => p.name === activeName);
            if (found) {
                const scoped = found.css.replace(
                    new RegExp(`\\.${found.name}-pattern`, "g"),
                    `.pattern-${editingIndex}`
                );
                setSelectedPatternCss(scoped);
            } else {
                setSelectedPatternCss("");
            }
        } else {
            setSelectedPatternCss("");
        }
    }, [isModalOpen, editingIndex, activePatterns, patternCssList, patterns]);

    const applyPatternToIndex = (pattern: Pattern, index: number) => {
        if (index === null) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];
        const targetDiv = divs[index];
        if (!targetDiv) return;

        Array.from(targetDiv.classList).forEach((cls) => {
            if (cls.startsWith("pattern-")) targetDiv.classList.remove(cls);
        });

        const scopedClass = `pattern-${index}`;
        targetDiv.classList.add(scopedClass);
        setPreviewHtml(doc.documentElement.innerHTML);

        const scopedCss = pattern.css.replace(new RegExp(`\\.${pattern.name}-pattern`, "g"), `.${scopedClass}`);

        injectPatternStyle(scopedCss, `pattern-style-${index}`);

        setActivePatterns((prev) => {
            const n = [...prev];
            n[index] = pattern.name;
            return n;
        });

        setPatternCssList((prev) => {
            const n = [...prev];
            n[index] = scopedCss;
            return n;
        });

        setSelectedPatternName(pattern.name);
        setSelectedPatternCss(scopedCss);
    };

    return (
        <div className="modal" id="modal-patterns">
            <div className="modal-dialog modal-fullscreen">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Selecionar Padrão</h1>
                    </div>

                    <div className="modal-body">
                        <div className="row main-row">
                            {/* LEFT SIDE */}
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
                                        preview={selectedPatternCss ?? ""}
                                        setPreview={(newCss) => {
                                            setSelectedPatternCss(newCss);
                                            if (editingIndex !== null) {
                                                setPatternCssList((prev) => {
                                                    const n = [...prev];
                                                    n[editingIndex] = newCss;
                                                    return n;
                                                });
                                                injectPatternStyle(newCss, `pattern-style-${editingIndex}`);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div className="col-5 right-side">
                                <div className="pattern-list-scroll">
                                    <div className="row pattern-list">
                                        {patterns.map((pattern, i) => (
                                            <div className="col-3" key={i}>
                                                <div
                                                    className={`pattern-preview ${pattern.name}-pattern ${
                                                        selectedPatternName === pattern.name ? "active" : ""
                                                    }`}
                                                    onClick={() =>
                                                        editingIndex !== null &&
                                                        applyPatternToIndex(pattern, editingIndex)
                                                    }
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

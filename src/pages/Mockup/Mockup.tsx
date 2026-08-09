import { useEffect, useRef, useState } from "react";

// Components
import MockupPreview from "./../../components/Mockup/MockupPreview";
import MockupEditor from "./../../components/Mockup/MockupEditor";
import MockupImages from "./../../components/Mockup/MockupImages";
import MockupPatterns from "./../../components/Mockup/MockupPatterns";
import MockupFonts from "../../components/Mockup/MockupFonts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

// CSS
import "./Mockup.css";

// Utils
import downloadPng from "../../utils/downloadFiles";
import injectPatternStyle from "../../utils/injectPatternStyle";
import {
    buildMockupConfig,
    downloadMockupConfig,
    readMockupConfigFile,
} from "../../utils/mockupConfig";

// Hooks
import { useToast } from "../../hooks/useToast";

interface Pattern {
    name: string;
    css: string;
}

const Mockup = () => {
    const [mockupTemplate, setMockupTemplate] = useState<string[]>([]);
    const [mockupTemplateSelected, setMockupTemplateSelected] =
        useState<string>("main");
    const [previewHtml, setPreviewHtml] = useState("");
    const [previewCss, setPreviewCss] = useState("");
    const [images, setImages] = useState<{ name: string; bg: string | null }[]>(
        [],
    );
    const [patternsInput, setPatternsInput] = useState<{ name: string }[]>([]);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    const [activePatterns, setActivePatterns] = useState<string[]>([]);
    const [patternCssList, setPatternCssList] = useState<string[]>([]);
    const [currentEditingIndex, setCurrentEditingIndex] = useState<
        number | null
    >(null);

    const skipTemplateLoad = useRef(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const { showError, showSuccess } = useToast();

    useEffect(() => {
        if (skipTemplateLoad.current) {
            skipTemplateLoad.current = false;
            return;
        }

        (async () => {
            setLoadingTemplate(true);

            try {
                const mockupTemplateFiles = import.meta.glob(
                    "/src/templates/mockups/*/*",
                    { as: "raw" },
                );

                for (const path in mockupTemplateFiles) {
                    let htmlLoaded = false;
                    let cssLoaded = false;

                    if (
                        path.includes(
                            `/src/templates/mockups/${mockupTemplateSelected}/`,
                        )
                    ) {
                        const loader = mockupTemplateFiles[path];
                        const content = await loader();
                        const extension =
                            path.split("/")?.pop()?.split(".").pop() ||
                            "unknown";

                        if (extension === "html" && !htmlLoaded) {
                            setPreviewHtml(content);
                            htmlLoaded = true;
                        }

                        if (extension === "css" && !cssLoaded) {
                            setPreviewCss(content);
                            cssLoaded = true;
                        }

                        if (htmlLoaded && cssLoaded) break;
                    }
                }

                setActivePatterns([]);
                setPatternCssList([]);
            } catch (err) {
                console.error(
                    `Erro ao carregar o template "${mockupTemplateSelected}":`,
                    err,
                );
                setPreviewHtml("<p>Erro ao carregar HTML do mockup.</p>");
                setPreviewCss("body { background: red; }");
                showError(
                    `Erro ao carregar o template "${mockupTemplateSelected}"`,
                );
            } finally {
                setLoadingTemplate(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mockupTemplateSelected]);

    useEffect(() => {
        (async () => {
            try {
                const files = import.meta.glob("/src/templates/mockups/*/*");
                const folders = new Set<string>();

                Object.keys(files).forEach((path) => {
                    const parts = path.split("/");
                    const folder = parts[parts.length - 2];
                    folders.add(folder);
                });

                setMockupTemplate(Array.from(folders).sort());

                const cssFiles = import.meta.glob(
                    "/src/templates/patterns/*.css",
                    { as: "raw" },
                );

                const loadedPatterns: Pattern[] = [];
                const loadedPatternNames = new Set<string>();

                for (const path in cssFiles) {
                    const loader = cssFiles[path];
                    const cssContent = await loader();
                    const name =
                        path.split("/").pop()?.replace(".css", "") || "unknown";

                    if (!loadedPatternNames.has(name)) {
                        if (
                            !document.querySelector(
                                `link[data-pattern="${name}"]`,
                            )
                        ) {
                            const blob = new Blob([cssContent], {
                                type: "text/css",
                            });
                            const href = URL.createObjectURL(blob);

                            const link = document.createElement("link");
                            link.rel = "stylesheet";
                            link.href = href;
                            link.setAttribute("data-pattern", name);
                            document.head.appendChild(link);
                        }

                        loadedPatterns.push({ name, css: cssContent });
                        loadedPatternNames.add(name);
                    }
                }

                setPatterns(loadedPatterns);
            } catch (err) {
                console.error("Erro ao carregar template:", err);
                showError("Erro ao carregar templates e padrões");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownload = async () => {
        await downloadPng("preview-display");
    };

    const handleExportConfig = () => {
        try {
            const config = buildMockupConfig(
                mockupTemplateSelected,
                previewHtml,
                previewCss,
                activePatterns,
            );
            downloadMockupConfig(config, `mockup-${mockupTemplateSelected}`);
            showSuccess("Configuração exportada com sucesso!");
        } catch (err) {
            console.error(err);
            showError("Erro ao exportar a configuração.");
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        try {
            const config = await readMockupConfigFile(file);

            skipTemplateLoad.current = true;
            setMockupTemplateSelected(config.template);
            setPreviewHtml(config.previewHtml);
            setPreviewCss(config.previewCss);
            setActivePatterns(config.activePatterns);

            Object.entries(config.patternStyles).forEach(([id, css]) => {
                injectPatternStyle(css, id);
            });

            setPatternCssList(
                config.activePatterns.map(
                    (_, i) => config.patternStyles[`pattern-style-${i}`] ?? "",
                ),
            );

            showSuccess("Configuração importada com sucesso!");
        } catch (err) {
            console.error(err);
            showError(
                err instanceof Error
                    ? err.message
                    : "Erro ao importar a configuração.",
            );
        }
    };

    return (
        <>
            <div id="sub-header">
                <h1>Mockup</h1>
                <div className="btn-list" role="tablist">
                    <div className="dropdown">
                        <button
                            className="btn btn-transparent dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            {mockupTemplateSelected}
                        </button>
                        <ul className="dropdown-menu">
                            {mockupTemplate.map((template) => (
                                <li key={template}>
                                    <a
                                        className="dropdown-item"
                                        href="#"
                                        onClick={() =>
                                            setMockupTemplateSelected(template)
                                        }
                                    >
                                        {template}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        className="btn btn-transparent active"
                        data-bs-toggle="tab"
                        data-bs-target="#html"
                        type="button"
                        role="tab"
                    >
                        HTML
                    </button>
                    <button
                        className="btn btn-transparent"
                        data-bs-toggle="tab"
                        data-bs-target="#css"
                        type="button"
                        role="tab"
                    >
                        CSS
                    </button>
                    <button
                        className={`btn btn-transparent ${!images.length ? "disabled" : ""}`}
                        data-bs-toggle="tab"
                        data-bs-target="#image"
                        type="button"
                        role="tab"
                    >
                        Imagens
                    </button>
                    <button
                        className={`btn btn-transparent ${!patternsInput.length ? "disabled" : ""}`}
                        data-bs-toggle="tab"
                        data-bs-target="#pattern"
                        type="button"
                        role="tab"
                    >
                        Padrões
                    </button>
                    <button
                        className="btn btn-transparent"
                        data-bs-toggle="tab"
                        data-bs-target="#fonts"
                        type="button"
                        role="tab"
                    >
                        Fontes
                    </button>

                    <button
                        className="btn btn-transparent"
                        type="button"
                        onClick={handleExportConfig}
                        title="Exportar configuração"
                    >
                        <i className="bi bi-download" aria-hidden="true"></i>{" "}
                        Exportar
                    </button>
                    <button
                        className="btn btn-transparent"
                        type="button"
                        onClick={handleImportClick}
                        title="Importar configuração"
                    >
                        <i className="bi bi-upload" aria-hidden="true"></i>{" "}
                        Importar
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        onChange={handleImportFile}
                    />

                    <button
                        className="btn btn-transparent"
                        type="button"
                        onClick={handleDownload}
                    >
                        Download
                    </button>
                </div>
            </div>

            <div id="mockup-page" className="container-fluid">
                <div className="row main-row">
                    <div className="col-xl-7 h-100">
                        {loadingTemplate ? (
                            <LoadingSpinner overlay size="lg" />
                        ) : (
                            <MockupPreview
                                previewHtml={previewHtml}
                                previewCss={previewCss}
                            />
                        )}
                    </div>

                    <div className="col-xl-5 h-100">
                        <div className="tab-content h-100">
                            <div
                                className="tab-pane h-100 overflow-auto show active"
                                id="html"
                                role="tabpanel"
                            >
                                <MockupEditor
                                    mode="html"
                                    preview={previewHtml}
                                    setPreview={setPreviewHtml}
                                />
                            </div>
                            <div
                                className="tab-pane h-100 overflow-auto"
                                id="css"
                                role="tabpanel"
                            >
                                <MockupEditor
                                    mode="css"
                                    preview={previewCss}
                                    setPreview={setPreviewCss}
                                />
                            </div>
                            <div
                                className="tab-pane h-100 overflow-auto"
                                id="image"
                                role="tabpanel"
                            >
                                <MockupImages
                                    images={images}
                                    setImages={setImages}
                                    previewHtml={previewHtml}
                                    setPreviewHtml={setPreviewHtml}
                                />
                            </div>
                            <div
                                className="tab-pane h-100 overflow-auto"
                                id="pattern"
                                role="tabpanel"
                            >
                                <MockupPatterns
                                    previewCss={previewCss}
                                    previewHtml={previewHtml}
                                    setPreviewHtml={setPreviewHtml}
                                    setPatternsInput={setPatternsInput}
                                    patternsInput={patternsInput}
                                    patterns={patterns}
                                    activePatterns={activePatterns}
                                    setActivePatterns={setActivePatterns}
                                    patternCssList={patternCssList}
                                    setPatternCssList={setPatternCssList}
                                    currentEditingIndex={currentEditingIndex}
                                    setCurrentEditingIndex={
                                        setCurrentEditingIndex
                                    }
                                />
                            </div>
                            <div
                                className="tab-pane h-100 overflow-auto"
                                id="fonts"
                                role="tabpanel"
                            >
                                <MockupFonts />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Mockup;

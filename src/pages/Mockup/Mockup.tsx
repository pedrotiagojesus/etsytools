import { useEffect, useState } from "react";

// Components
import MockupPreview from "./../../components/Mockup/MockupPreview";
import MockupEditor from "./../../components/Mockup/MockupEditor";
import MockupImages from "./../../components/Mockup/MockupImages";
import MockupPatterns from "./../../components/Mockup/MockupPatterns";

// CSS
import "./Mockup.css";

// Utils
import downloadPng from "../../utils/downloadFiles";

interface Pattern {
    name: string;
    css: string;
}

const Mockup = () => {
    const [previewHtml, setPreviewHtml] = useState("");
    const [previewCss, setPreviewCss] = useState("");
    const [images, setImages] = useState<{ name: string; bg: string | null }[]>([]);
    const [patternsInput, setPatternsInput] = useState<{ name: string }[]>([]);
    const [patterns, setPatterns] = useState<Pattern[]>([]);

    // Carrega HTML e CSS padrão
    useEffect(() => {
        (async () => {
            try {
                const html = await (await fetch(`/templates/mockups/main/example.html`)).text();
                const css = await (await fetch(`/templates/mockups/main/example.css`)).text();
                setPreviewHtml(html);
                setPreviewCss(css);

                const cssFiles = import.meta.glob("/src/templates/patterns/*.css", { eager: true });
                const loadedPatterns: Pattern[] = Object.entries(cssFiles).map(([path, content]) => ({
                    name: path.split("/").pop()?.split(".")[0] || "",
                    css: content as string, // força TypeScript entender que é string
                }));

                setPatterns(loadedPatterns);
            } catch (err) {
                console.error("Erro ao carregar template:", err);
            }
        })();
    }, []);

    const handleDownload = async () => {
        await downloadPng("preview-content");
    };

    return (
        <div id="mockup-page">
            <div id="sub-header">
                <h1>Mockup</h1>
                <div className="btn-list" role="tablist">
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
                    <button className="btn btn-transparent" onClick={handleDownload}>
                        Download
                    </button>
                </div>
            </div>

            <div className="container-fluid">
                <div className="row main-row">
                    <div className="col-xl-7">
                        <MockupPreview previewHtml={previewHtml} previewCss={previewCss} />
                    </div>

                    <div className="col-xl-5">
                        <div className="tab-content h-100">
                            <div className="tab-pane show active h-100" id="html" role="tabpanel">
                                <MockupEditor mode="html" preview={previewHtml} setPreview={setPreviewHtml} />
                            </div>
                            <div className="tab-pane h-100" id="css" role="tabpanel">
                                <MockupEditor mode="css" preview={previewCss} setPreview={setPreviewCss} />
                            </div>
                            <div className="tab-pane h-100" id="image" role="tabpanel">
                                <MockupImages
                                    images={images}
                                    setImages={setImages}
                                    previewHtml={previewHtml}
                                    setPreviewHtml={setPreviewHtml}
                                />
                            </div>
                            <div className="tab-pane h-100" id="pattern" role="tabpanel">
                                <MockupPatterns
                                    previewHtml={previewHtml}
                                    setPreviewHtml={setPreviewHtml}
                                    setPatternsInput={setPatternsInput}
                                    patternsInput={patternsInput}
                                    patterns={patterns}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mockup;

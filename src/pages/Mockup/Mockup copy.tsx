import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useEffect, useState } from "react";

// Ace Editor
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-html";

// CSS
import "./Mockup.css";

// Utils
import downloadPng from "../../utils/downloadFiles";
import { centerContent } from "../../utils/centerMockuptPreview";

const cssFiles = import.meta.glob("/src/templates/patterns/*.css", { eager: true });
const cssList = Object.entries(cssFiles).map(([path, content]) => ({
    name: path.split("/").pop()?.split(".")[0] || "",
    content,
}));

const Mockup = () => {
    const [previewHtml, setPreviewHtml] = useState<string>("");
    const [previewCss, setPreviewCss] = useState<string>("");
    const [imageInputs, setImageInputs] = useState<React.ReactNode[]>([]);
    const [guideLine, setGuideLine] = useState<boolean>(false);
    const [patternInputs, setPatternsInputs] = useState<React.ReactNode[]>([]);
    const [activePattern, setActivePattern] = useState<string | null>(null);

    const handleEditorHtmlChange = (value: string | undefined) => {
        setPreviewHtml(value || "");
    };

    const handleEditorCssChange = (value: string | undefined) => {
        setPreviewCss(value || "");
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    useEffect(() => {
        fetch(`/templates/mockups/main/example.html`)
            .then((res) => res.text())
            .then((text) => {
                setPreviewHtml(text);
            })
            .catch((err) => {
                console.error("Erro ao carregar HTML:", err);
            });

        fetch(`/templates/mockups/main/example.css`)
            .then((res) => res.text())
            .then((text) => {
                setPreviewCss(text);
            })
            .catch((err) => {
                console.error("Erro ao carregar CSS:", err);
            });
    }, []);

    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divsImg = Array.from(doc.querySelectorAll("div[data-img]")) as HTMLDivElement[];

        const inputsImg = divsImg.map((div, index) => {
            const bgImage = div.style.backgroundImage;
            const name = div.getAttribute("data-title") || `Imagem ${index + 1}`;
            const hasImage = !!bgImage && bgImage !== "none";

            return (
                <div key={index} className="row image-input">
                    <div className="col-3">
                        <div
                            className="image-preview"
                            style={{
                                backgroundImage: hasImage ? bgImage : "none",
                            }}
                        >
                            {!hasImage && <i className="bi bi-image"></i>}
                        </div>
                    </div>
                    <div className="col-9">
                        <h5>{name}</h5>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const base64 = await fileToBase64(file);
                                    div.style.backgroundImage = `url(${base64})`;

                                    setPreviewHtml(doc.documentElement.innerHTML);
                                }
                            }}
                        />
                    </div>
                </div>
            );
        });

        setImageInputs(inputsImg);

        const divsPattern = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const inputsPattern = divsPattern.map((div, index) => {
            // const bgImage = div.style.backgroundImage;
            // const name = div.getAttribute("data-title") || `Imagem ${index + 1}`;
            // const hasImage = !!bgImage && bgImage !== "none";

            return <div key={index}>PATTERN</div>;
        });

        setPatternsInputs(inputsPattern);
    }, [previewHtml]);

    const Controls = () => {
        const { zoomIn, zoomOut, setTransform } = useControls();

        const handleCenter = async () => {
            centerContent(setTransform);
        };

        return (
            <div className="tools">
                <button className="btn btn-primary" onClick={() => zoomIn()}>
                    <i className="bi bi-plus"></i>
                </button>
                <button className="btn btn-primary" onClick={() => zoomOut()}>
                    <i className="bi bi-dash"></i>
                </button>
                <button className="btn btn-primary" onClick={handleCenter}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button
                    className={`btn ${guideLine ? "btn-success" : "btn-primary"}`}
                    onClick={() => setGuideLine(!guideLine)}
                >
                    <i className="bi bi-rulers"></i>
                </button>
            </div>
        );
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
                        className={`btn btn-transparent ${!imageInputs.length ? "disabled" : ""}`}
                        data-bs-toggle="tab"
                        data-bs-target="#image"
                        type="button"
                        role="tab"
                    >
                        Imagens
                    </button>
                    <button
                        className={`btn btn-transparent ${!patternInputs.length ? "disabled" : ""}`}
                        data-bs-toggle="tab"
                        data-bs-target="#pattern"
                        type="button"
                        role="tab"
                    >
                        Padrões
                    </button>
                    <button className="btn btn-transparent" onClick={async () => await downloadPng("preview-content")}>
                        Download
                    </button>
                </div>
            </div>
            <div className="container-fluid">
                <div className="row main-row">
                    <div className="col-xl-7">
                        <div id="preview-section">
                            <TransformWrapper
                                minScale={0.1}
                                centerOnInit
                                limitToBounds={false}
                                onInit={({ setTransform }) => {
                                    centerContent(setTransform);
                                }}
                            >
                                {() => (
                                    <>
                                        <Controls />
                                        <TransformComponent>
                                            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
                                            <div
                                                id="preview-content"
                                                className="preview-content"
                                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                                            ></div>
                                            <div
                                                className={`guide-lines ${guideLine ? "" : "d-none"}`}
                                                id="guide-lines"
                                            ></div>
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
                        </div>
                    </div>
                    <div className="col-xl-5">
                        <div className="tab-content h-100">
                            <div className="tab-pane show active h-100" id="html" role="tabpanel">
                                <AceEditor
                                    mode="html"
                                    theme="monokai"
                                    onChange={handleEditorHtmlChange}
                                    fontSize={14}
                                    value={previewHtml}
                                    width="100%"
                                    height="100%"
                                    setOptions={{
                                        showLineNumbers: true,
                                        tabSize: 4,
                                        useWorker: false,
                                    }}
                                />
                            </div>
                            <div className="tab-pane h-100" id="css" role="tabpanel">
                                <AceEditor
                                    mode="css"
                                    theme="monokai"
                                    onChange={handleEditorCssChange}
                                    fontSize={14}
                                    value={previewCss}
                                    width="100%"
                                    height="100%"
                                    setOptions={{
                                        showLineNumbers: true,
                                        tabSize: 4,
                                        useWorker: false,
                                    }}
                                />
                            </div>
                            <div className="tab-pane h-100" id="image" role="tabpanel">
                                {imageInputs.length ? imageInputs : <p>Nenhuma imagem encontrada.</p>}
                            </div>
                            <div className="tab-pane h-100" id="pattern" role="tabpanel">
                                <div className="pattern-list">
                                    {cssList.map((css) => (
                                        <div
                                            key={css.name}
                                            title={css.name}
                                            className={`pattern-preview ${css.name}-pattern`}
                                            onClick={() => setActivePattern(css.content)}
                                        ></div>
                                    ))}
                                </div>
                                {patternInputs.length ? patternInputs : <p>Nenhum padrão encontrado.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mockup;

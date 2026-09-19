// Components
import MockupPreview from "@components/Mockup/MockupPreview";
import MockupEditor from "@components/Mockup/MockupEditor";
import MockupImages from "@components/Mockup/MockupImages";
import MockupPatterns from "@components/Mockup/MockupPatterns";
import MockupFonts from "@components/Mockup/MockupFonts";
import MockupSlides from "@components/Mockup/MockupSlides";
import ModalEtsyThumbnail from "@components/Mockup/ModalEtsyThumbnail";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";

// CSS
import "./Mockup.css";

// Hooks
import { useMockupEditor } from "@hooks/useMockupEditor";

const Mockup = () => {
    const editor = useMockupEditor();
    const {
        activeSlideId,
        mockupTemplateSelected,
        mockupTemplate,
        setMockupTemplateSelected,
        images,
        patternsInput,
        importInputRef,
        loadingTemplate,
        previewHtml,
        previewCss,
        handleImportClick,

        updateHtml,
        updateCss,

        exportConfig,
        downloadPreview,
        importConfig,
    } = editor;

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
                                        onClick={() => setMockupTemplateSelected(template)}
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
                        data-bs-target="#slides"
                        type="button"
                        role="tab"
                    >
                        Ficha do Produto
                    </button>
                    <button
                        className="btn btn-transparent"
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
                        id="pattern-tab-trigger"
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
                        onClick={exportConfig}
                        title="Exportar configuração"
                    >
                        <i className="bi bi-download" aria-hidden="true"></i> Exportar
                    </button>
                    <button
                        className="btn btn-transparent"
                        type="button"
                        onClick={handleImportClick}
                        title="Importar configuração"
                    >
                        <i className="bi bi-upload" aria-hidden="true"></i> Importar
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        onChange={importConfig}
                    />

                    <button className="btn btn-transparent" type="button" onClick={downloadPreview}>
                        Download
                    </button>
                    <button
                        className="btn btn-transparent"
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#modal-etsy-thumbnail"
                    >
                        <i className="bi bi-grid-3x3-gap" aria-hidden="true"></i> Ver como thumbnail Etsy
                    </button>
                </div>
            </div>

            <div id="mockup-page" className="container-fluid">
                <div className="row main-row">
                    <div className="col-xl-7 h-100">
                        {loadingTemplate ? (
                            <LoadingSpinner overlay size="lg" />
                        ) : (
                            <MockupPreview previewHtml={previewHtml} previewCss={previewCss} />
                        )}
                    </div>

                    <div className="col-xl-5 h-100">
                        <div className="tab-content h-100">
                            <div className="tab-pane h-100 overflow-auto show active" id="slides" role="tabpanel">
                                <MockupSlides editor={editor} />
                            </div>
                            <div className="tab-pane h-100 overflow-auto" id="html" role="tabpanel">
                                <MockupEditor key={`html-${activeSlideId}`} mode="html" preview={previewHtml} onChange={updateHtml} />
                            </div>
                            <div className="tab-pane h-100 overflow-auto" id="css" role="tabpanel">
                                <MockupEditor key={`css-${activeSlideId}`} mode="css" preview={previewCss} onChange={updateCss} />
                            </div>
                            <div className="tab-pane h-100 overflow-auto" id="image" role="tabpanel">
                                <MockupImages editor={editor} />
                            </div>
                            <div className="tab-pane h-100 overflow-auto" id="pattern" role="tabpanel">
                                <MockupPatterns editor={editor} />
                            </div>
                            <div className="tab-pane h-100 overflow-auto" id="fonts" role="tabpanel">
                                <MockupFonts />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalEtsyThumbnail previewHtml={previewHtml} previewCss={previewCss} />
        </>
    );
};

export default Mockup;

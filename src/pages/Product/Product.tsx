import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import JSZip from "jszip";

// CSS
import "./Product.css";

// Components
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";
import ProductUploadStep from "@components/Product/ProductUploadStep";
import ProductProcessingStep from "@components/Product/ProductProcessingStep";
import MockupSlides from "@components/Mockup/MockupSlides";
import MockupWorkspace from "@components/Mockup/MockupWorkspace";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { downloadProductZip, fetchPageImage, startProductJob, waitForJob } from "@utils/imgtools-api";
import type { JobStatusResponse, ProductPage } from "@utils/imgtools-api";
import { resizeImageUrl } from "@utils/resize-image";
import { padPosition, renderElementToBlob, saveBlob, saveUrl, toFileSlug } from "@utils/download-files";
import { buildMockupConfig, downloadMockupConfig, readMockupConfigFile } from "@utils/mockup-config";
import {
    createSlide,
    DEFAULT_MOCKUP_TEMPLATE,
    duplicateSlide,
    listMockupTemplates,
    loadPatternLibrary,
    MOCKUP_PREVIEW_DISPLAY_ID,
} from "@utils/mockup-slides";
import type { MockupSlide, MockupTab, Pattern } from "@utils/mockup-slides";

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
    { id: 1, label: "Imagens" },
    { id: 2, label: "Processamento" },
    { id: 3, label: "Mockups" },
];

const THUMBNAIL_MAX_SIZE = 320;

// Fonts are loaded asynchronously by MockupPreview; give them a moment
// after the slide is painted before capturing it.
const FONT_SETTLE_MS = 300;

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

const errorMessageOf = (error: unknown, fallback: string): string => (error instanceof Error ? error.message : fallback);

const waitForSlideRender = async (): Promise<void> => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await new Promise((resolve) => window.setTimeout(resolve, FONT_SETTLE_MS));
    await document.fonts.ready;
};

const dataUrlToBase64 = (dataUrl: string): string => dataUrl.slice(dataUrl.indexOf(",") + 1);

const Product = () => {
    const [step, setStep] = useState<Step>(1);

    // Processing
    const [productTitle, setProductTitle] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState("");
    const [pages, setPages] = useState<ProductPage[]>([]);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Mockups
    const [templates] = useState<string[]>(listMockupTemplates);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [slides, setSlides] = useState<MockupSlide[]>([]);
    const [activeSlideId, setActiveSlideId] = useState("");
    const [activeTab, setActiveTab] = useState<MockupTab>("html");
    const [isExporting, setIsExporting] = useState(false);
    const importInputRef = useRef<HTMLInputElement>(null);

    const { showError, showSuccess } = useToast();

    const activeSlide = slides.find((slide) => slide.id === activeSlideId);
    const activeSlidePosition = slides.findIndex((slide) => slide.id === activeSlideId) + 1;
    const fileSlug = toFileSlug(productTitle);

    useEffect(() => {
        const loadMockupDefaults = async () => {
            try {
                const [patternLibrary, firstSlide] = await Promise.all([
                    loadPatternLibrary(),
                    createSlide(DEFAULT_MOCKUP_TEMPLATE),
                ]);
                setPatterns(patternLibrary);
                setSlides([firstSlide]);
                setActiveSlideId(firstSlide.id);
            } catch (error) {
                console.error("Erro ao carregar templates e padrões:", error);
                showError("Erro ao carregar templates e padrões");
            }
        };

        loadMockupDefaults();
    }, [showError]);

    // Stops polling the API when leaving the page
    useEffect(() => () => abortControllerRef.current?.abort(), []);

    // ---------- Processing ----------

    const handleProcess = async (images: File[], title: string, description: string) => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setProductTitle(title);
        setJobId(null);
        setJobStatus(null);
        setProcessingError("");
        setPages([]);
        setIsProcessing(true);
        setStep(2);

        try {
            const newJobId = await startProductJob(images, title, description);
            setJobId(newJobId);

            const finalStatus = await waitForJob(newJobId, setJobStatus, controller.signal);

            setIsLoadingPages(true);
            const pageNumbers = Array.from({ length: finalStatus.pageCount ?? 0 }, (_, index) => index + 1);
            const loadedPages = await Promise.all(
                pageNumbers.map(async (pageNumber) => {
                    const image = await fetchPageImage(newJobId, pageNumber);
                    const thumbnail = await resizeImageUrl(image, THUMBNAIL_MAX_SIZE, THUMBNAIL_MAX_SIZE);
                    return { image, thumbnail };
                }),
            );
            setPages(loadedPages);

            showSuccess("Produto processado com sucesso!");
        } catch (error) {
            if (isAbortError(error)) return;

            console.error("Erro ao processar o produto:", error);
            const message = errorMessageOf(error, "Erro ao processar o produto.");
            setProcessingError(message);
            showError(message);
        } finally {
            setIsLoadingPages(false);
            setIsProcessing(false);
        }
    };

    const handleDownloadProduct = async () => {
        if (!jobId) return;

        setIsDownloading(true);
        try {
            const { blob, filename } = await downloadProductZip(jobId);
            saveBlob(blob, filename);
        } catch (error) {
            console.error("Erro ao descarregar o produto:", error);
            showError(errorMessageOf(error, "Não foi possível descarregar o produto."));
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadImages = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            pages.forEach((page, index) => {
                zip.file(`page-${padPosition(index + 1)}.png`, dataUrlToBase64(page.image), { base64: true });
            });
            saveBlob(await zip.generateAsync({ type: "blob" }), `${fileSlug}-imagens.zip`);
        } catch (error) {
            console.error("Erro ao criar o ZIP das imagens:", error);
            showError("Não foi possível criar o ZIP das imagens.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadPage = (pageIndex: number) => {
        const page = pages[pageIndex];
        if (page) saveUrl(page.image, `${fileSlug}-page-${padPosition(pageIndex + 1)}.png`);
    };

    // ---------- Slides ----------

    const updateSlide = useCallback((slideId: string, update: (slide: MockupSlide) => Partial<MockupSlide>) => {
        setSlides((prev) => prev.map((slide) => (slide.id === slideId ? { ...slide, ...update(slide) } : slide)));
    }, []);

    const handleAddSlide = async (template: string) => {
        try {
            const slide = await createSlide(template);
            setSlides((prev) => [...prev, slide]);
            setActiveSlideId(slide.id);
        } catch (error) {
            console.error(`Erro ao carregar o template "${template}":`, error);
            showError(`Erro ao carregar o template "${template}"`);
        }
    };

    const handleDuplicateSlide = (slideId: string) => {
        const index = slides.findIndex((slide) => slide.id === slideId);
        const original = slides[index];
        if (!original) return;

        const copy = duplicateSlide(original);
        setSlides([...slides.slice(0, index + 1), copy, ...slides.slice(index + 1)]);
        setActiveSlideId(copy.id);
    };

    const handleDeleteSlide = (slideId: string) => {
        if (slides.length <= 1) return;

        const index = slides.findIndex((slide) => slide.id === slideId);
        const remaining = slides.filter((slide) => slide.id !== slideId);
        setSlides(remaining);

        if (slideId === activeSlideId) {
            const neighbour = remaining[Math.min(index, remaining.length - 1)];
            if (neighbour) setActiveSlideId(neighbour.id);
        }
    };

    const handleChangeTemplate = async (template: string) => {
        if (!activeSlide || template === activeSlide.template) return;
        if (!window.confirm("Mudar o template apaga as alterações deste slide. Continuar?")) return;

        try {
            const replacement = await createSlide(template);
            setSlides((prev) => prev.map((slide) => (slide.id === activeSlide.id ? replacement : slide)));
            setActiveSlideId(replacement.id);
        } catch (error) {
            console.error(`Erro ao carregar o template "${template}":`, error);
            showError(`Erro ao carregar o template "${template}"`);
        }
    };

    // ---------- Export ----------

    const handleDownloadSlide = async () => {
        try {
            const blob = await renderElementToBlob(MOCKUP_PREVIEW_DISPLAY_ID, "jpeg");
            saveBlob(blob, `${fileSlug}-${padPosition(activeSlidePosition)}.jpg`);
        } catch (error) {
            console.error("Erro ao gerar a imagem do slide:", error);
            showError("Não foi possível gerar a imagem do slide.");
        }
    };

    /**
     * Shows each slide in turn (pattern styles are per slide, so only the
     * visible one renders correctly) and captures it into a ZIP named in
     * listing order: 01.jpg, 02.jpg…
     */
    const handleExportAllSlides = async () => {
        const originalSlideId = activeSlideId;
        setIsExporting(true);

        try {
            const zip = new JSZip();

            for (const [index, slide] of slides.entries()) {
                flushSync(() => setActiveSlideId(slide.id));
                await waitForSlideRender();
                zip.file(`${padPosition(index + 1)}.jpg`, await renderElementToBlob(MOCKUP_PREVIEW_DISPLAY_ID, "jpeg"));
            }

            saveBlob(await zip.generateAsync({ type: "blob" }), `${fileSlug}-mockups.zip`);
            showSuccess(`${slides.length} slides exportados.`);
        } catch (error) {
            console.error("Erro ao exportar os slides:", error);
            showError("Não foi possível exportar os slides.");
        } finally {
            setActiveSlideId(originalSlideId);
            setIsExporting(false);
        }
    };

    const handleExportConfig = () => {
        try {
            downloadMockupConfig(buildMockupConfig(slides), `${fileSlug}-mockups`);
            showSuccess("Configuração exportada com sucesso!");
        } catch (error) {
            console.error("Erro ao exportar a configuração:", error);
            showError("Erro ao exportar a configuração.");
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        try {
            const importedSlides = await readMockupConfigFile(file);
            setSlides(importedSlides);
            setActiveSlideId(importedSlides[0]?.id ?? "");
            showSuccess(`Configuração importada: ${importedSlides.length} slides.`);
        } catch (error) {
            console.error("Erro ao importar a configuração:", error);
            showError(errorMessageOf(error, "Erro ao importar a configuração."));
        }
    };

    const isStepEnabled = (stepId: Step): boolean => stepId !== 2 || jobId !== null || isProcessing;

    return (
        <>
            <div id="sub-header">
                <h1>Produto</h1>
                <nav className="btn-list product-steps" aria-label="Passos do produto">
                    {STEPS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`btn btn-transparent ${step === item.id ? "active" : ""}`}
                            aria-current={step === item.id ? "step" : undefined}
                            disabled={!isStepEnabled(item.id) || isExporting}
                            onClick={() => setStep(item.id)}
                        >
                            {item.id}. {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {isExporting && <LoadingSpinner isOverlay size="lg" />}

            {/* Kept mounted so the selected images survive switching steps */}
            <div className="container-fluid" hidden={step !== 1}>
                <ProductUploadStep isProcessing={isProcessing} onSubmit={handleProcess} />
            </div>

            {step === 2 && (
                <div className="container-fluid">
                    <ProductProcessingStep
                        jobStatus={jobStatus}
                        pages={pages}
                        isLoadingPages={isLoadingPages}
                        isDownloading={isDownloading}
                        errorMessage={processingError}
                        onDownloadProduct={handleDownloadProduct}
                        onDownloadImages={handleDownloadImages}
                        onDownloadPage={handleDownloadPage}
                        onGoToMockups={() => setStep(3)}
                    />
                </div>
            )}

            {step === 3 && (
                <div id="mockup-page" className="container-fluid">
                    <div className="mockup-toolbar btn-list">
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                disabled={!activeSlide || isExporting}
                            >
                                Template: {activeSlide?.template ?? "—"}
                            </button>
                            <ul className="dropdown-menu">
                                {templates.map((template) => (
                                    <li key={template}>
                                        <button
                                            type="button"
                                            className="dropdown-item"
                                            onClick={() => handleChangeTemplate(template)}
                                        >
                                            {template}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button type="button" className="btn btn-outline-secondary" onClick={handleDownloadSlide} disabled={isExporting}>
                            <i className="bi bi-image" aria-hidden="true"></i> Descarregar slide
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleExportAllSlides} disabled={isExporting}>
                            <i className="bi bi-file-earmark-zip" aria-hidden="true"></i> Exportar todos (ZIP)
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary ms-auto"
                            onClick={handleExportConfig}
                            disabled={isExporting}
                            title="Guardar os slides num ficheiro JSON"
                        >
                            <i className="bi bi-download" aria-hidden="true"></i> Guardar configuração
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => importInputRef.current?.click()}
                            disabled={isExporting}
                            title="Abrir slides de um ficheiro JSON"
                        >
                            <i className="bi bi-upload" aria-hidden="true"></i> Abrir configuração
                        </button>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json"
                            hidden
                            onChange={handleImportFile}
                        />
                    </div>

                    <div className="row mockup-body">
                        <div className="col-xl-2 h-100 overflow-auto">
                            <MockupSlides
                                slides={slides}
                                activeSlideId={activeSlideId}
                                templates={templates}
                                isDisabled={isExporting}
                                onSelect={setActiveSlideId}
                                onAdd={handleAddSlide}
                                onDuplicate={handleDuplicateSlide}
                                onDelete={handleDeleteSlide}
                                onReorder={setSlides}
                            />
                        </div>
                        <div className="col-xl-10 h-100">
                            {activeSlide ? (
                                <MockupWorkspace
                                    key={activeSlide.id}
                                    slide={activeSlide}
                                    onSlideChange={updateSlide}
                                    patterns={patterns}
                                    pages={pages}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                />
                            ) : (
                                <LoadingSpinner size="lg" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product;

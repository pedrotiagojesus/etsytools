import { useState } from "react";
import { useToast } from "@hooks/useToast";
import { exportSlidesAsZip, type ExportProgress, type SpecWarning } from "@utils/exportSlidesAsZip";
import { exportSocialFormatsZip } from "@utils/exportSocialFormatsZip";
import type { MockupEditorState } from "@hooks/useMockupEditor";

interface MockupSlidesProps {
    editor: MockupEditorState;
}

const MockupSlides: React.FC<MockupSlidesProps> = ({ editor }) => {
    const { slides, activeSlideId, selectSlide, addSlide, removeSlide, duplicateSlide, renameSlide, reorderSlides, mockupTemplate } =
        editor;

    const { showError, showSuccess, showWarning } = useToast();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newSlideName, setNewSlideName] = useState("");
    const [newSlideTemplate, setNewSlideTemplate] = useState(mockupTemplate[0] ?? "");

    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState<ExportProgress | null>(null);
    const [specWarnings, setSpecWarnings] = useState<SpecWarning[]>([]);

    const [watermarkEnabled, setWatermarkEnabled] = useState(false);
    const [watermarkText, setWatermarkText] = useState("PREVIEW");
    // Texto vazio com a opção ligada não deve gerar uma marca "invisível".
    const activeWatermark = watermarkEnabled && watermarkText.trim() ? watermarkText.trim() : undefined;

    const [generatingSocial, setGeneratingSocial] = useState(false);
    const [progressSocial, setProgressSocial] = useState<ExportProgress | null>(null);

    const handleAddSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        await addSlide(newSlideTemplate || undefined, newSlideName);
        setNewSlideName("");
        setShowAddForm(false);
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        setProgress(null);
        setSpecWarnings([]);

        try {
            const result = await exportSlidesAsZip(slides, setProgress, activeWatermark);
            setSpecWarnings(result.specWarnings);

            if (result.failed.length === 0) {
                showSuccess(`${result.ok.length} imagens geradas com sucesso!`);
            } else if (result.ok.length === 0) {
                showError("Não foi possível gerar nenhuma imagem.");
            } else {
                showWarning(`${result.ok.length} imagens geradas, ${result.failed.length} falharam (ver consola).`);
                console.error("Slides que falharam a gerar:", result.failed);
            }
        } catch (err) {
            console.error(err);
            showError("Erro ao gerar as imagens do produto.");
        } finally {
            setGenerating(false);
            setProgress(null);
        }
    };

    const handleExportSocial = async () => {
        setGeneratingSocial(true);
        setProgressSocial(null);

        try {
            const result = await exportSocialFormatsZip(slides, setProgressSocial, activeWatermark);

            if (result.failed.length === 0) {
                showSuccess(`Imagens para redes sociais geradas (${result.ok.length} slides)!`);
            } else if (result.ok.length === 0) {
                showError("Não foi possível gerar nenhuma imagem para redes sociais.");
            } else {
                showWarning(`${result.ok.length} slides gerados, ${result.failed.length} falharam (ver consola).`);
                console.error("Slides que falharam a gerar (redes sociais):", result.failed);
            }
        } catch (err) {
            console.error(err);
            showError("Erro ao gerar as imagens para redes sociais.");
        } finally {
            setGeneratingSocial(false);
            setProgressSocial(null);
        }
    };

    return (
        <div id="slides-page">
            <p className="text-muted">
                Configura cada imagem da ficha do Etsy (capa, exemplos, informações, ...) como um slide separado —
                cada um com o seu template, imagens e padrões — e gera todas de uma vez no fim.
            </p>

            <div className="slides-toolbar">
                <button type="button" className="btn btn-primary" onClick={() => setShowAddForm((v) => !v)}>
                    <i className="bi bi-plus-lg" aria-hidden="true"></i> Adicionar slide
                </button>
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleGenerateAll}
                    disabled={generating || generatingSocial || slides.length === 0}
                >
                    {generating ? (
                        <>
                            <i className="bi bi-hourglass-split" aria-hidden="true"></i>{" "}
                            {progress ? `A gerar ${progress.current} de ${progress.total} (${progress.slideName})…` : "A gerar…"}
                        </>
                    ) : (
                        <>
                            <i className="bi bi-download" aria-hidden="true"></i> Gerar tudo ({slides.length})
                        </>
                    )}
                </button>
                <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleExportSocial}
                    disabled={generating || generatingSocial || slides.length === 0}
                >
                    {generatingSocial ? (
                        <>
                            <i className="bi bi-hourglass-split" aria-hidden="true"></i>{" "}
                            {progressSocial
                                ? `A gerar ${progressSocial.current} de ${progressSocial.total} (${progressSocial.slideName})…`
                                : "A gerar…"}
                        </>
                    ) : (
                        <>
                            <i className="bi bi-share" aria-hidden="true"></i> Exportar para redes sociais
                        </>
                    )}
                </button>
            </div>

            <div className="watermark-option">
                <div className="form-check mb-0">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="watermark-enabled"
                        checked={watermarkEnabled}
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="watermark-enabled">
                        Marca de água nas imagens exportadas
                    </label>
                </div>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    disabled={!watermarkEnabled}
                    maxLength={30}
                    aria-label="Texto da marca de água"
                />
            </div>

            {specWarnings.length > 0 && (
                <div className="spec-warnings">
                    <p className="spec-warnings-title">Specs do Etsy</p>
                    {specWarnings.map((warning, index) => (
                        <p
                            key={`${warning.name}-${index}`}
                            className={`spec-warning-row ${warning.severity === "high" ? "high" : ""}`}
                        >
                            <b>{warning.name}</b>: {warning.width}×{warning.height}px — {warning.message}
                        </p>
                    ))}
                </div>
            )}

            {showAddForm && (
                <form className="add-slide-form" onSubmit={handleAddSlide}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={`Slide ${slides.length + 1}`}
                        value={newSlideName}
                        onChange={(e) => setNewSlideName(e.target.value)}
                        aria-label="Nome do novo slide"
                    />
                    <select
                        className="form-select"
                        value={newSlideTemplate}
                        onChange={(e) => setNewSlideTemplate(e.target.value)}
                        aria-label="Template inicial do novo slide"
                    >
                        {mockupTemplate.map((template) => (
                            <option key={template} value={template}>
                                {template}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-primary">
                        Criar
                    </button>
                </form>
            )}

            <ul className="slide-list">
                {slides.map((slide, index) => (
                    <li key={slide.id} className={`slide-row ${slide.id === activeSlideId ? "active" : ""}`}>
                        <button
                            type="button"
                            className="slide-select"
                            onClick={() => selectSlide(slide.id)}
                            aria-current={slide.id === activeSlideId}
                        >
                            <span className="slide-name">{slide.name}</span>
                            <span className="slide-template">{slide.mockupTemplateSelected}</span>
                        </button>

                        <div className="slide-actions">
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => reorderSlides(index, index - 1)}
                                disabled={index === 0}
                                aria-label={`Mover "${slide.name}" para cima`}
                                title="Mover para cima"
                            >
                                <i className="bi bi-arrow-up" aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => reorderSlides(index, index + 1)}
                                disabled={index === slides.length - 1}
                                aria-label={`Mover "${slide.name}" para baixo`}
                                title="Mover para baixo"
                            >
                                <i className="bi bi-arrow-down" aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => {
                                    const name = window.prompt("Novo nome do slide:", slide.name);
                                    if (name && name.trim()) renameSlide(slide.id, name.trim());
                                }}
                                aria-label={`Renomear "${slide.name}"`}
                                title="Renomear"
                            >
                                <i className="bi bi-pencil" aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => duplicateSlide(slide.id)}
                                aria-label={`Duplicar "${slide.name}"`}
                                title="Duplicar"
                            >
                                <i className="bi bi-files" aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent text-danger"
                                onClick={() => removeSlide(slide.id)}
                                disabled={slides.length <= 1}
                                aria-label={`Remover "${slide.name}"`}
                                title="Remover"
                            >
                                <i className="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MockupSlides;

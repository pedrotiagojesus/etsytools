import type { JobPhase, JobStatusResponse, ProductPage } from "@utils/imgtools-api";
import {
    ETSY_MAX_DIGITAL_FILE_BYTES,
    ETSY_MAX_DIGITAL_FILES,
    estimateDataUrlBytes,
    exceedsDigitalFileLimit,
    formatMegabytes,
} from "@utils/etsy-limits";

const PHASES: { id: JobPhase; label: string }[] = [
    { id: "image-processing", label: "A converter e ajustar as imagens" },
    { id: "svg-vectorization", label: "A vetorizar" },
    { id: "svg-rasterization", label: "A preparar para impressão" },
    { id: "pdf-generation", label: "A criar o PDF" },
    { id: "page-images", label: "A gerar as páginas" },
    { id: "zip", label: "A criar o ZIP" },
];

interface ProductProcessingStepProps {
    jobStatus: JobStatusResponse | null;
    pages: ProductPage[];
    isLoadingPages: boolean;
    isDownloading: boolean;
    errorMessage: string;
    onDownloadProduct: () => void;
    onDownloadImages: () => void;
    onDownloadPage: (pageIndex: number) => void;
    onGoToMockups: () => void;
}

const getProgress = (jobStatus: JobStatusResponse | null): { percent: number; label: string } => {
    if (!jobStatus || jobStatus.status === "queued") return { percent: 0, label: "Em fila de espera..." };
    if (jobStatus.status === "completed") return { percent: 100, label: "Concluído" };
    if (!jobStatus.progress) return { percent: 0, label: "A começar..." };

    const { phase, completed, total } = jobStatus.progress;
    const phaseIndex = PHASES.findIndex((item) => item.id === phase);
    const phaseFraction = total > 0 ? completed / total : 0;
    const percent = Math.round(((phaseIndex + phaseFraction) / PHASES.length) * 100);
    const label = `${PHASES[phaseIndex]?.label ?? phase} (${completed}/${total})`;

    return { percent, label };
};

interface FileSizeRowProps {
    label: string;
    bytes: number;
    isEstimate: boolean;
}

const FileSizeRow = ({ label, bytes, isEstimate }: FileSizeRowProps) => {
    const isTooBig = exceedsDigitalFileLimit(bytes);

    return (
        <li className={isTooBig ? "text-danger" : undefined}>
            <i className={`bi ${isTooBig ? "bi-x-circle-fill" : "bi-check-circle-fill text-success"}`} aria-hidden="true"></i>{" "}
            {label}: {isEstimate ? "cerca de " : ""}
            {formatMegabytes(bytes)}
            {isTooBig && " — acima do limite do Etsy"}
        </li>
    );
};

const ProductProcessingStep = ({
    jobStatus,
    pages,
    isLoadingPages,
    isDownloading,
    errorMessage,
    onDownloadProduct,
    onDownloadImages,
    onDownloadPage,
    onGoToMockups,
}: ProductProcessingStepProps) => {
    const { percent, label } = getProgress(jobStatus);
    const isCompleted = jobStatus?.status === "completed";
    const productZipBytes = jobStatus?.resultSizeBytes ?? null;
    const imagesZipBytes = pages.reduce((total, page) => total + estimateDataUrlBytes(page.image), 0);
    const isAnyFileTooBig =
        (productZipBytes !== null && exceedsDigitalFileLimit(productZipBytes)) || exceedsDigitalFileLimit(imagesZipBytes);

    return (
        <div className="product-processing">
            <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                    <span>{errorMessage ? "O processamento falhou" : label}</span>
                    <span>{percent}%</span>
                </div>
                <div
                    className="progress"
                    role="progressbar"
                    aria-label="Progresso do processamento"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className={`progress-bar ${errorMessage ? "bg-danger" : ""} ${isCompleted ? "" : "progress-bar-striped progress-bar-animated"}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
                {errorMessage && (
                    <div className="alert alert-danger mt-3" role="alert">
                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i> {errorMessage}
                    </div>
                )}
            </div>

            {isCompleted && (
                <>
                    <section className="etsy-limits mb-3" aria-label="Limites do Etsy">
                        <ul className="list-unstyled mb-1">
                            {productZipBytes !== null && (
                                <FileSizeRow label="Produto (ZIP)" bytes={productZipBytes} isEstimate={false} />
                            )}
                            {pages.length > 0 && <FileSizeRow label="Imagens (ZIP)" bytes={imagesZipBytes} isEstimate />}
                        </ul>
                        <small className="text-muted">
                            O Etsy aceita até {ETSY_MAX_DIGITAL_FILES} ficheiros por produto digital, cada um com até{" "}
                            {formatMegabytes(ETSY_MAX_DIGITAL_FILE_BYTES)}.
                        </small>
                        {isAnyFileTooBig && (
                            <div className="alert alert-warning mt-2 mb-0" role="alert">
                                Um dos ficheiros passa o limite. Divide as páginas em dois produtos (ou em dois ZIPs) antes
                                de os carregar no Etsy.
                            </div>
                        )}
                    </section>

                    <div className="btn-list mb-4">
                        <button type="button" className="btn btn-primary" onClick={onDownloadProduct} disabled={isDownloading}>
                            <i className="bi bi-file-earmark-zip" aria-hidden="true"></i> Descarregar produto (ZIP)
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={onDownloadImages}
                            disabled={isDownloading || pages.length === 0}
                        >
                            <i className="bi bi-images" aria-hidden="true"></i> Descarregar imagens
                        </button>
                        <button type="button" className="btn btn-success" onClick={onGoToMockups}>
                            Criar mockups <i className="bi bi-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>

                    {isLoadingPages ? (
                        <p className="text-muted" role="status">
                            A carregar as páginas...
                        </p>
                    ) : (
                        <ol className="row g-3 list-unstyled page-grid">
                            {pages.map((page, index) => (
                                <li key={index} className="col-6 col-md-3 col-xl-2">
                                    <figure className="page-thumbnail">
                                        <img src={page.thumbnail} alt={`Página ${index + 1}`} />
                                        <figcaption>
                                            <span>Página {index + 1}</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => onDownloadPage(index)}
                                                aria-label={`Descarregar a página ${index + 1}`}
                                                title="Descarregar"
                                            >
                                                <i className="bi bi-download" aria-hidden="true"></i>
                                            </button>
                                        </figcaption>
                                    </figure>
                                </li>
                            ))}
                        </ol>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductProcessingStep;

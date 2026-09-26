import { useEffect, useState } from "react";
import { computePagePreviewLayout, PDF_PAGES } from "@utils/pdfPagePreview";
import { PAPER_LABELS, type PaperSize } from "@utils/paperSizes";
import { useImageDimensions } from "@hooks/useImageDimensions";

// CSS
import "./PrintPreviewGrid.css";

interface PrintPreviewGridProps {
    images: File[];
    /** Formatos que o ZIP vai incluir; com mais de um, dá para alternar a vista. */
    paperSizes: PaperSize[];
}

const PrintPreviewGrid: React.FC<PrintPreviewGridProps> = ({ images, paperSizes }) => {
    const dimensions = useImageDimensions(images);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [viewedSize, setViewedSize] = useState<PaperSize>(paperSizes[0]);

    // A vista escolhida pode deixar de existir se o formato for desmarcado.
    const paperSize = paperSizes.includes(viewedSize) ? viewedSize : paperSizes[0];
    const page = PDF_PAGES[paperSize];
    const insetX = `${(page.marginPt / page.widthPt) * 100}%`;
    const insetY = `${(page.marginPt / page.heightPt) * 100}%`;

    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    if (images.length === 0) return null;

    return (
        <div className="print-preview">
            <p className="print-preview-note">
                Pré-visualização de como cada imagem vai ficar na página {PAPER_LABELS[paperSize]} do PDF
                (margens e borda incluídas).
            </p>
            {paperSizes.length > 1 && (
                <div
                    className="btn-group btn-group-sm print-preview-sizes"
                    role="group"
                    aria-label="Formato da pré-visualização"
                >
                    {paperSizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            className={`btn ${size === paperSize ? "btn-primary" : "btn-outline-primary"}`}
                            aria-pressed={size === paperSize}
                            onClick={() => setViewedSize(size)}
                        >
                            {PAPER_LABELS[size]}
                        </button>
                    ))}
                </div>
            )}
            <div className="print-preview-grid">
                {dimensions.map(({ file, naturalWidth, naturalHeight, loading }, index) => {
                    const layout = loading
                        ? null
                        : computePagePreviewLayout(naturalWidth, naturalHeight, paperSize);

                    return (
                        <div
                            key={`${file.name}-${index}`}
                            className={`print-preview-page${loading ? " loading" : ""}`}
                            style={{ aspectRatio: `${page.widthPt} / ${page.heightPt}` }}
                        >
                            <div
                                className="print-preview-border"
                                style={{ top: insetY, bottom: insetY, left: insetX, right: insetX }}
                            >
                                {layout && previewUrls[index] && (
                                    <img
                                        src={previewUrls[index]}
                                        alt=""
                                        style={{
                                            width: `${layout.widthPercent}%`,
                                            height: `${layout.heightPercent}%`,
                                        }}
                                    />
                                )}
                            </div>
                            {layout?.isSparse && (
                                <span
                                    className="print-preview-sparse-badge"
                                    title="Esta imagem vai ficar com bastante espaço em branco à volta na página."
                                >
                                    ⚠
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PrintPreviewGrid;

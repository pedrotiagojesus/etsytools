import { useEffect, useState } from "react";
import { computePagePreviewLayout } from "@utils/pdfPagePreview";
import { useImageDimensions } from "@hooks/useImageDimensions";

// CSS
import "./PrintPreviewGrid.css";

interface PrintPreviewGridProps {
    images: File[];
    selectedFiles?: Set<File>;
    onToggleSelect?: (file: File) => void;
    maxSelectable?: number;
}

const PrintPreviewGrid: React.FC<PrintPreviewGridProps> = ({
    images,
    selectedFiles,
    onToggleSelect,
    maxSelectable,
}) => {
    const dimensions = useImageDimensions(images);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
                Pré-visualização de como cada imagem vai ficar na página A4 do PDF (margens e borda incluídas).
                Hoje só é gerado A4 — formato Letter ainda não está disponível.
            </p>
            <div className="print-preview-grid">
                {dimensions.map(({ file, naturalWidth, naturalHeight, loading }, index) => {
                    const layout = loading
                        ? null
                        : computePagePreviewLayout(naturalWidth, naturalHeight);

                    const isSelected = selectedFiles?.has(file) ?? false;
                    const selectionDisabled =
                        !isSelected &&
                        maxSelectable !== undefined &&
                        (selectedFiles?.size ?? 0) >= maxSelectable;

                    return (
                        <div
                            key={`${file.name}-${index}`}
                            className={`print-preview-page${loading ? " loading" : ""}`}
                        >
                            {onToggleSelect && (
                                <label
                                    className="print-preview-select"
                                    title="Marcar como página de amostra"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={selectionDisabled}
                                        onChange={() => onToggleSelect(file)}
                                    />
                                </label>
                            )}
                            <div className="print-preview-border">
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

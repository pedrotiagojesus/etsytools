import { useEffect, useState } from "react";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { previewVectorization } from "@utils/imgtools-api";

const THRESHOLD_MIN = 120;
const THRESHOLD_MAX = 250;
const THRESHOLD_STEP = 5;

interface VectorizePreviewProps {
    images: File[];
    threshold: number;
    onThresholdChange: (threshold: number) => void;
}

const VectorizePreview = ({ images, threshold, onThresholdChange }: VectorizePreviewProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [originalUrl, setOriginalUrl] = useState("");
    const [vectorizedUrl, setVectorizedUrl] = useState("");
    const [previewedThreshold, setPreviewedThreshold] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { showError } = useToast();

    const selectedImage = images[Math.min(selectedIndex, images.length - 1)];

    // Object URLs must be released when replaced or on unmount
    useEffect(() => () => URL.revokeObjectURL(originalUrl), [originalUrl]);
    useEffect(() => () => URL.revokeObjectURL(vectorizedUrl), [vectorizedUrl]);

    const handlePreview = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        try {
            const svg = await previewVectorization(selectedImage, threshold);
            setOriginalUrl(URL.createObjectURL(selectedImage));
            setVectorizedUrl(URL.createObjectURL(svg));
            setPreviewedThreshold(threshold);
        } catch (error) {
            console.error("Erro na pré-visualização da vetorização:", error);
            showError(error instanceof Error ? error.message : "Não foi possível pré-visualizar a vetorização.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <fieldset className="vectorize-preview mb-3">
            <legend className="form-label fs-6">Vetorização</legend>

            <label htmlFor="threshold" className="form-label">
                Limiar: <strong>{threshold}</strong>{" "}
                <small className="text-muted">(mais alto = linhas mais grossas; mais baixo = só os traços mais escuros)</small>
            </label>
            <input
                id="threshold"
                type="range"
                className="form-range"
                min={THRESHOLD_MIN}
                max={THRESHOLD_MAX}
                step={THRESHOLD_STEP}
                value={threshold}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
            />

            <div className="d-flex flex-wrap gap-2 align-items-center">
                <select
                    className="form-select w-auto"
                    aria-label="Imagem para pré-visualizar"
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                    disabled={images.length === 0}
                >
                    {images.map((image, index) => (
                        <option key={`${image.name}-${index}`} value={index}>
                            {index + 1}. {image.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handlePreview}
                    disabled={!selectedImage || isLoading}
                >
                    {isLoading ? "A vetorizar..." : "Pré-visualizar"}
                </button>
                {previewedThreshold !== null && previewedThreshold !== threshold && (
                    <small className="text-muted">A pré-visualização é do limiar {previewedThreshold}.</small>
                )}
            </div>

            {vectorizedUrl && (
                <div className="row g-2 mt-2">
                    <figure className="col-6 m-0">
                        <img src={originalUrl} alt="Imagem original" className="vectorize-image" />
                        <figcaption className="text-muted small">Original</figcaption>
                    </figure>
                    <figure className="col-6 m-0">
                        <img src={vectorizedUrl} alt="Imagem vetorizada" className="vectorize-image" />
                        <figcaption className="text-muted small">Vetorizada (limiar {previewedThreshold})</figcaption>
                    </figure>
                </div>
            )}
        </fieldset>
    );
};

export default VectorizePreview;

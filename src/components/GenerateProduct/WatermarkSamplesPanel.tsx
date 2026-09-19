import { useState } from "react";
import { generateWatermarkedSamplesZip } from "@utils/watermarkSamples";
import { useToast } from "@hooks/useToast";

// CSS
import "./WatermarkSamplesPanel.css";

interface WatermarkSamplesPanelProps {
    images: File[];
    selectedFiles: Set<File>;
}

const MIN_SAMPLES = 2;
const MAX_SAMPLES = 4;

const WatermarkSamplesPanel: React.FC<WatermarkSamplesPanelProps> = ({ images, selectedFiles }) => {
    const [watermarkText, setWatermarkText] = useState("PREVIEW");
    const [generating, setGenerating] = useState(false);
    const { showSuccess, showError } = useToast();

    if (images.length === 0) return null;

    const count = selectedFiles.size;
    const inRange = count >= MIN_SAMPLES && count <= MAX_SAMPLES;

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const result = await generateWatermarkedSamplesZip(Array.from(selectedFiles), watermarkText);
            if (result.failed.length > 0) {
                showError(`Falhou para: ${result.failed.map((f) => f.name).join(", ")}`);
            }
            if (result.ok.length > 0) {
                showSuccess("Amostras com marca de água geradas!");
            }
        } catch (err) {
            console.error(err);
            showError(err instanceof Error ? err.message : "Erro ao gerar amostras.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="watermark-samples">
            <p className="watermark-samples-title">Páginas de amostra com marca de água</p>

            {!inRange ? (
                <p className="text-muted small mb-0">
                    Seleciona entre {MIN_SAMPLES} e {MAX_SAMPLES} páginas na grelha acima (checkbox no canto de cada página) para gerar amostras.
                </p>
            ) : (
                <div className="watermark-samples-controls">
                    <label htmlFor="watermark-text" className="form-label mb-0">
                        Texto da marca de água
                    </label>
                    <input
                        id="watermark-text"
                        type="text"
                        className="form-control"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={generating}
                        onClick={handleGenerate}
                    >
                        {generating ? "A gerar..." : `Gerar amostras (${count}) — ZIP`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WatermarkSamplesPanel;

import { PAPER_LABELS, PAPER_SIZES, type PaperSize } from "@utils/paperSizes";
import type { ProductOptions } from "@utils/generateProductJob";

// CSS
import "./ProductOptionsPanel.css";

interface ProductOptionsPanelProps {
    options: ProductOptions;
    onChange: (options: ProductOptions) => void;
}

const ProductOptionsPanel: React.FC<ProductOptionsPanelProps> = ({ options, onChange }) => {
    const togglePaperSize = (size: PaperSize) => {
        const isSelected = options.paperSizes.includes(size);

        // Tem de sobrar pelo menos um formato — o backend rejeita a lista vazia.
        if (isSelected && options.paperSizes.length === 1) return;

        const next = isSelected
            ? options.paperSizes.filter((s) => s !== size)
            : PAPER_SIZES.filter((s) => s === size || options.paperSizes.includes(s));

        onChange({ ...options, paperSizes: next });
    };

    return (
        <div className="product-options">
            <h5>Conteúdo do ZIP</h5>

            <div className="mb-3">
                <span className="form-label d-block">Formato do papel</span>
                {PAPER_SIZES.map((size) => (
                    <div className="form-check form-check-inline" key={size}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`paper-size-${size}`}
                            checked={options.paperSizes.includes(size)}
                            onChange={() => togglePaperSize(size)}
                        />
                        <label className="form-check-label" htmlFor={`paper-size-${size}`}>
                            {PAPER_LABELS[size]}
                        </label>
                    </div>
                ))}
                <div className="form-text">
                    Com os dois formatos, o ZIP traz um PDF e uma pasta de imagens por formato.
                </div>
            </div>

            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="option-cover-page"
                    checked={options.includeCoverPage}
                    onChange={(e) => onChange({ ...options, includeCoverPage: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="option-cover-page">
                    Página de rosto com teste de cor
                </label>
            </div>
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="option-terms"
                    checked={options.includeTerms}
                    onChange={(e) => onChange({ ...options, includeTerms: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="option-terms">
                    Ficheiro de termos de uso
                </label>
            </div>
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="option-print-instructions"
                    checked={options.includePrintInstructions}
                    onChange={(e) => onChange({ ...options, includePrintInstructions: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="option-print-instructions">
                    Instruções de impressão
                </label>
            </div>
        </div>
    );
};

export default ProductOptionsPanel;

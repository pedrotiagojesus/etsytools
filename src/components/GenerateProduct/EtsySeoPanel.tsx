import { useMemo, useState } from "react";
import {
    AUDIENCE_LABELS,
    generateEtsyListing,
    TAG_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    type EtsyAudience,
} from "@utils/etsySeo";
import { generateListingDescription } from "@utils/listingDescription";
import { useToast } from "@hooks/useToast";

// CSS
import "./EtsySeoPanel.css";

interface EtsySeoPanelProps {
    theme: string;
    pageCount: number;
}

const AUDIENCE_OPTIONS = Object.keys(AUDIENCE_LABELS) as EtsyAudience[];

const EtsySeoPanel: React.FC<EtsySeoPanelProps> = ({ theme, pageCount }) => {
    const [audience, setAudience] = useState<EtsyAudience>("all");
    const { showSuccess, showError } = useToast();

    const { title, tags } = useMemo(
        () => generateEtsyListing({ theme, pageCount, audience }),
        [theme, pageCount, audience],
    );

    const description = useMemo(
        () => generateListingDescription({ theme, pageCount, audience }),
        [theme, pageCount, audience],
    );

    const copyToClipboard = async (text: string, successMessage: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess(successMessage);
        } catch (err) {
            console.error(err);
            showError("Não foi possível copiar. Copia manualmente.");
        }
    };

    return (
        <div className="etsy-seo-panel">
            <h5>SEO para o Etsy</h5>
            <p className="text-muted small">
                Sugestão de título e tags para a ficha do Etsy, a partir do título acima — o texto fica em
                inglês, a língua em que o Etsy realmente vende.
            </p>

            <div className="mb-3">
                <label htmlFor="etsy-audience" className="form-label">
                    Público-alvo
                </label>
                <select
                    id="etsy-audience"
                    className="form-select"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as EtsyAudience)}
                >
                    {AUDIENCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {AUDIENCE_LABELS[option]}
                        </option>
                    ))}
                </select>
            </div>

            {!theme.trim() ? (
                <p className="text-muted">Escreve um título acima para gerares sugestões de SEO.</p>
            ) : (
                <>
                    <div className="mb-3">
                        <div className="etsy-seo-field-head">
                            <label htmlFor="etsy-title" className="form-label mb-0">
                                Título sugerido
                            </label>
                            <span className="etsy-seo-counter">
                                {title.length}/{TITLE_MAX_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id="etsy-title"
                            className="form-control"
                            rows={2}
                            readOnly
                            value={title}
                        ></textarea>
                        <button
                            type="button"
                            className="btn btn-sm btn-transparent mt-1"
                            onClick={() => copyToClipboard(title, "Título copiado!")}
                        >
                            <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar título
                        </button>
                    </div>

                    <div className="mb-2">
                        <div className="etsy-seo-field-head">
                            <span className="form-label mb-0">Tags sugeridas ({tags.length}/13)</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-transparent"
                                onClick={() => copyToClipboard(tags.join(", "), "Tags copiadas!")}
                            >
                                <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar todas
                            </button>
                        </div>
                        <ul className="etsy-seo-tags">
                            {tags.map((tag) => (
                                <li key={tag}>
                                    <button
                                        type="button"
                                        className="etsy-seo-tag"
                                        onClick={() => copyToClipboard(tag, `"${tag}" copiada!`)}
                                        title="Copiar esta tag"
                                    >
                                        {tag}
                                        <span className="etsy-seo-tag-length">{tag.length}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted small mb-0">
                            Cada tag pode ter até {TAG_MAX_LENGTH} caracteres — clica numa tag para a copiar.
                        </p>
                    </div>

                    <div className="mb-2">
                        <div className="etsy-seo-field-head">
                            <label htmlFor="etsy-description" className="form-label mb-0">
                                Descrição sugerida
                            </label>
                        </div>
                        <textarea
                            id="etsy-description"
                            className="form-control"
                            rows={6}
                            readOnly
                            value={description}
                        ></textarea>
                        <button
                            type="button"
                            className="btn btn-sm btn-transparent mt-1"
                            onClick={() => copyToClipboard(description, "Descrição copiada!")}
                        >
                            <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar descrição
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EtsySeoPanel;

import { useState } from "react";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { buildListingText, isValidTag, normalizeTag } from "@utils/listing-text";
import { ETSY_MAX_TAGS, ETSY_TAG_MAX_LENGTH, ETSY_TITLE_MAX_LENGTH } from "@utils/etsy-limits";

interface ProductListingStepProps {
    productTitle: string;
    productDescription: string;
    pageCount: number;
}

const splitKeywords = (text: string): string[] => text.split(",").map(normalizeTag).filter(Boolean);

const ProductListingStep = ({ productTitle, productDescription, pageCount }: ProductListingStepProps) => {
    const [theme, setTheme] = useState("");
    const [keywords, setKeywords] = useState("");
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [description, setDescription] = useState("");
    const [hasGenerated, setHasGenerated] = useState(false);

    const { showError, showSuccess } = useToast();

    const handleGenerate = () => {
        const listing = buildListingText(
            {
                titulo: productTitle,
                paginas: pageCount > 0 ? String(pageCount) : "",
                descricao: productDescription,
                tema: theme.trim(),
            },
            splitKeywords(keywords),
        );

        setTitle(listing.title);
        setTags(listing.tags);
        setDescription(listing.description);
        setHasGenerated(true);
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        const tag = normalizeTag(newTag);
        if (!tag || tags.includes(tag)) return;

        setTags([...tags, tag]);
        setNewTag("");
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess(`${label} copiado.`);
        } catch (error) {
            console.error("Erro ao copiar para a área de transferência:", error);
            showError("Não foi possível copiar. Seleciona o texto e copia à mão.");
        }
    };

    const isTitleTooLong = title.length > ETSY_TITLE_MAX_LENGTH;
    const hasTooManyTags = tags.length > ETSY_MAX_TAGS;

    return (
        <div className="product-listing">
            <p className="text-muted">
                O texto é gerado a partir dos modelos em <code>src/templates/listing/</code> (<code>title.txt</code>,{" "}
                <code>tags.txt</code>, <code>description.txt</code>), com os campos <code>{"{titulo}"}</code>,{" "}
                <code>{"{paginas}"}</code>, <code>{"{descricao}"}</code> e <code>{"{tema}"}</code>.
            </p>

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label htmlFor="listing-theme" className="form-label">
                        Tema
                    </label>
                    <input
                        id="listing-theme"
                        type="text"
                        className="form-control"
                        placeholder="ex: paris"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    />
                </div>
                <div className="col-md-8">
                    <label htmlFor="listing-keywords" className="form-label">
                        Palavras-chave para as tags (separadas por vírgulas, entram primeiro)
                    </label>
                    <input
                        id="listing-keywords"
                        type="text"
                        className="form-control"
                        placeholder="ex: eiffel tower, french gift"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                </div>
            </div>

            <button type="button" className="btn btn-primary mb-4" onClick={handleGenerate} disabled={!productTitle}>
                <i className="bi bi-magic" aria-hidden="true"></i> {hasGenerated ? "Gerar outra vez" : "Gerar texto"}
            </button>
            {!productTitle && <p className="text-muted">Processa primeiro o produto (passo 1) para ter o título.</p>}

            {hasGenerated && (
                <>
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-end mb-1">
                            <label htmlFor="listing-title" className="form-label mb-0">
                                Título
                            </label>
                            <span className={isTitleTooLong ? "text-danger" : "text-muted"}>
                                {title.length}/{ETSY_TITLE_MAX_LENGTH}
                            </span>
                        </div>
                        <div className="input-group">
                            <input
                                id="listing-title"
                                type="text"
                                className={`form-control ${isTitleTooLong ? "is-invalid" : ""}`}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => copyToClipboard(title, "Título")}>
                                <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-end mb-1">
                            <span className="form-label mb-0">Tags</span>
                            <span className={hasTooManyTags ? "text-danger" : "text-muted"}>
                                {tags.length}/{ETSY_MAX_TAGS}
                            </span>
                        </div>
                        <ul className="listing-tags list-unstyled">
                            {tags.map((tag) => (
                                <li key={tag} className={`listing-tag ${isValidTag(tag) ? "" : "is-invalid"}`}>
                                    {tag}
                                    <small>{tag.length}</small>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label={`Remover a tag ${tag}`}
                                        onClick={() => setTags(tags.filter((item) => item !== tag))}
                                    ></button>
                                </li>
                            ))}
                        </ul>
                        <form className="input-group" onSubmit={handleAddTag}>
                            <input
                                type="text"
                                className="form-control"
                                aria-label="Nova tag"
                                placeholder={`Nova tag (até ${ETSY_TAG_MAX_LENGTH} caracteres)`}
                                maxLength={ETSY_TAG_MAX_LENGTH}
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                            />
                            <button type="submit" className="btn btn-outline-secondary">
                                Adicionar
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(tags.join(", "), "Tags")}
                            >
                                <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar
                            </button>
                        </form>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-end mb-1">
                            <label htmlFor="listing-description" className="form-label mb-0">
                                Descrição
                            </label>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => copyToClipboard(description, "Descrição")}
                            >
                                <i className="bi bi-clipboard" aria-hidden="true"></i> Copiar
                            </button>
                        </div>
                        <textarea
                            id="listing-description"
                            className="form-control"
                            rows={16}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductListingStep;

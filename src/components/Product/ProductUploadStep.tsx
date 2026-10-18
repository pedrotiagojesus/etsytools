import { useEffect, useState } from "react";

// Components
import ImageUploader from "@components/ImageUploader/ImageUploader";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import Tooltip from "@components/Tooltip/Tooltip";
import ValidationFeedback from "@components/ValidationFeedback/ValidationFeedback";
import VectorizePreview from "@components/Product/VectorizePreview";
import DuplicateWarnings from "@components/Product/DuplicateWarnings";
import PrintPreviewGrid from "@components/Product/PrintPreviewGrid";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { validateImageFiles } from "@utils/file-validation";
import { DEFAULT_VECTORIZE_THRESHOLD } from "@utils/imgtools-api";
import type { ProductJobOptions } from "@utils/imgtools-api";
import { PAPER_LABELS, PAPER_SIZES } from "@utils/paper-sizes";
import type { PaperSize } from "@utils/paper-sizes";

// Templates
import defaultTermsText from "@templates/listing/terms.txt?raw";

// Limits enforced by the API (generateProductSchema in studio-base-api)
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;
const TERMS_MAX_LENGTH = 2000;

// Below this, fine details may be lost when the image is vectorized and
// printed on an A4 page at 300 DPI (2480 px wide)
const MIN_RECOMMENDED_SIDE = 1024;

interface ImageSize {
    width: number;
    height: number;
}

const readImageSize = async (file: File): Promise<ImageSize> => {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
};

const isLowResolution = (size: ImageSize): boolean => Math.min(size.width, size.height) < MIN_RECOMMENDED_SIDE;

interface ProductUploadStepProps {
    isProcessing: boolean;
    onSubmit: (images: File[], options: ProductJobOptions) => void;
}

const validateTitle = (value: string): string => {
    if (!value.trim()) return "";
    if (value.trim().length < TITLE_MIN_LENGTH) return `O título deve ter pelo menos ${TITLE_MIN_LENGTH} caracteres`;
    if (value.length > TITLE_MAX_LENGTH) return `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres`;
    return "";
};

const ProductUploadStep = ({ isProcessing, onSubmit }: ProductUploadStepProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [titleError, setTitleError] = useState("");
    const [imageSizes, setImageSizes] = useState<Map<File, ImageSize>>(new Map());
    const [threshold, setThreshold] = useState(DEFAULT_VECTORIZE_THRESHOLD);
    const [hasCoverPage, setHasCoverPage] = useState(true);
    // Both by default: Etsy buyers in the US print on Letter
    const [paperSizes, setPaperSizes] = useState<PaperSize[]>([...PAPER_SIZES]);
    const [hasTermsPage, setHasTermsPage] = useState(true);
    const [termsText, setTermsText] = useState(defaultTermsText.trim());

    const { showError, showWarning } = useToast();

    // Reads the size of newly added images (for the low resolution warning)
    useEffect(() => {
        const unknownImages = images.filter((image) => !imageSizes.has(image));
        if (unknownImages.length === 0) return;

        const readNewSizes = async () => {
            const results = await Promise.allSettled(unknownImages.map(readImageSize));
            const readSizes = new Map<File, ImageSize>();
            results.forEach((result, index) => {
                const image = unknownImages[index];
                if (result.status === "fulfilled" && image) readSizes.set(image, result.value);
                if (result.status === "rejected") console.error("Erro ao ler o tamanho da imagem:", result.reason);
            });
            // Functional update: another read may have finished in the meantime
            setImageSizes((previous) => new Map([...previous, ...readSizes]));

            const lowResolutionCount = Array.from(readSizes.values()).filter(isLowResolution).length;
            if (lowResolutionCount > 0) {
                showWarning(
                    `${lowResolutionCount} imagem(ns) com menos de ${MIN_RECOMMENDED_SIDE} px no lado menor: os detalhes finos podem perder-se.`,
                );
            }
        };

        readNewSizes();
    }, [images, imageSizes, showWarning]);

    const renderImageInfo = (file: File) => {
        const size = imageSizes.get(file);
        if (!size) return null;

        return (
            <span className={isLowResolution(size) ? "text-warning" : undefined}>
                {isLowResolution(size) && <i className="bi bi-exclamation-triangle-fill" aria-label="Resolução baixa"></i>}{" "}
                {size.width}×{size.height}
            </span>
        );
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
        setTitleError(validateTitle(value));
    };

    // Valida as imagens assim que são selecionadas, para dar feedback imediato
    const handleImagesChange = (newImages: File[]) => {
        if (newImages.length === 0) {
            setImages(newImages);
            return;
        }

        const validation = validateImageFiles(newImages);
        if (!validation.isValid) {
            showError(validation.message ?? "Uma ou mais imagens são inválidas.");
            return; // mantém a seleção anterior válida
        }

        setImages(newImages);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            showWarning("Selecione pelo menos uma imagem.");
            return;
        }

        if (!title.trim() || validateTitle(title)) {
            showWarning("Indique um título válido.");
            return;
        }

        const validation = validateImageFiles(images);
        if (!validation.isValid) {
            showError(validation.message ?? "Uma ou mais imagens são inválidas.");
            return;
        }

        if (paperSizes.length === 0) {
            showWarning("Escolha pelo menos um tamanho de papel.");
            return;
        }

        onSubmit(images, {
            title: title.trim(),
            description: description.trim(),
            threshold,
            hasCoverPage,
            paperSizes,
            termsText: hasTermsPage ? termsText.trim() : "",
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <Tooltip content="Imagens a preto e branco do produto (máx. 15MB por imagem, PNG/JPEG/WEBP). Arraste para mudar a ordem das páginas.">
                    <label className="form-label">Imagens</label>
                </Tooltip>
                <ImageUploader onChange={handleImagesChange} renderOverlay={renderImageInfo} />
                <DuplicateWarnings images={images} />
            </div>

            <VectorizePreview images={images} threshold={threshold} onThresholdChange={setThreshold} />

            <div className="mb-3">
                <Tooltip content={`Título do produto, usado no PDF e no nome do ZIP (${TITLE_MIN_LENGTH} a ${TITLE_MAX_LENGTH} caracteres)`}>
                    <label htmlFor="title" className="form-label">
                        Título
                    </label>
                </Tooltip>
                <input
                    type="text"
                    className={`form-control ${titleError ? "is-invalid" : ""}`}
                    id="title"
                    maxLength={TITLE_MAX_LENGTH}
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                />
                <ValidationFeedback isValid={!titleError} message={titleError} shouldShowValidState={false} />
            </div>

            <div className="mb-3">
                <Tooltip content={`Descrição guardada nas propriedades do PDF (máx. ${DESCRIPTION_MAX_LENGTH} caracteres)`}>
                    <label htmlFor="description" className="form-label">
                        Descrição
                    </label>
                </Tooltip>
                <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>

            <fieldset className="mb-3">
                <legend className="form-label fs-6">Tamanho do papel</legend>
                <p className="text-muted small mb-1">Um PDF por tamanho no ZIP. A maioria dos compradores do Etsy imprime em US Letter.</p>
                {PAPER_SIZES.map((size) => (
                    <div className="form-check form-check-inline" key={size}>
                        <input
                            id={`paper-size-${size}`}
                            type="checkbox"
                            className="form-check-input"
                            checked={paperSizes.includes(size)}
                            onChange={(e) =>
                                setPaperSizes(
                                    e.target.checked
                                        ? PAPER_SIZES.filter((item) => item === size || paperSizes.includes(item))
                                        : paperSizes.filter((item) => item !== size),
                                )
                            }
                        />
                        <label htmlFor={`paper-size-${size}`} className="form-check-label">
                            {PAPER_LABELS[size]}
                        </label>
                    </div>
                ))}
                {paperSizes.length > 0 && <PrintPreviewGrid images={images} paperSizes={paperSizes} />}
            </fieldset>

            <fieldset className="mb-3">
                <legend className="form-label fs-6">Capa e termos de uso</legend>
                <div className="form-check">
                    <input
                        id="has-cover-page"
                        type="checkbox"
                        className="form-check-input"
                        checked={hasCoverPage}
                        onChange={(e) => setHasCoverPage(e.target.checked)}
                    />
                    <label htmlFor="has-cover-page" className="form-check-label">
                        Capa com o título (primeira página)
                    </label>
                </div>
                <div className="form-check">
                    <input
                        id="has-terms-page"
                        type="checkbox"
                        className="form-check-input"
                        checked={hasTermsPage}
                        onChange={(e) => setHasTermsPage(e.target.checked)}
                    />
                    <label htmlFor="has-terms-page" className="form-check-label">
                        Termos de uso (ficheiro TXT à parte no ZIP)
                    </label>
                </div>
                {hasTermsPage && (
                    <textarea
                        className="form-control mt-2"
                        aria-label="Texto dos termos de uso"
                        rows={6}
                        maxLength={TERMS_MAX_LENGTH}
                        value={termsText}
                        onChange={(e) => setTermsText(e.target.value)}
                    ></textarea>
                )}
            </fieldset>

            <ButtonSubmit isDisabled={isProcessing} description={isProcessing ? "A processar..." : "Processar imagens"} />
        </form>
    );
};

export default ProductUploadStep;

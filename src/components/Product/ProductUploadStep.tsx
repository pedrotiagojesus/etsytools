import { useState } from "react";

// Components
import ImageUploader from "@components/ImageUploader/ImageUploader";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import Tooltip from "@components/Tooltip/Tooltip";
import ValidationFeedback from "@components/ValidationFeedback/ValidationFeedback";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { validateImageFiles } from "@utils/file-validation";

// Limits enforced by the API (generateProductSchema in studio-base-api)
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

interface ProductUploadStepProps {
    isProcessing: boolean;
    onSubmit: (images: File[], title: string, description: string) => void;
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

    const { showError, showWarning } = useToast();

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

        onSubmit(images, title.trim(), description.trim());
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <Tooltip content="Imagens a preto e branco do produto (máx. 15MB por imagem, PNG/JPEG/WEBP). Arraste para mudar a ordem das páginas.">
                    <label className="form-label">Imagens</label>
                </Tooltip>
                <ImageUploader onChange={handleImagesChange} />
            </div>

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

            <ButtonSubmit isDisabled={isProcessing} description={isProcessing ? "A processar..." : "Processar imagens"} />
        </form>
    );
};

export default ProductUploadStep;

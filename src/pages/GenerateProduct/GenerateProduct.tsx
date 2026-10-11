import { useState } from "react";

// CSS
import "./GenerateProduct.css";

// Components
import ImageUploader from "@components/ImageUploader/ImageUploader";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";
import Tooltip from "@components/Tooltip/Tooltip";
import ValidationFeedback from "@components/ValidationFeedback/ValidationFeedback";

// Hooks
import { useToast } from "@hooks/use-toast";

// Utils
import { validateImageFiles } from "@utils/file-validation";
import { downloadProductZip, startProductJob, waitForJob } from "@utils/imgtools-api";
import { saveBlob } from "@utils/download-files";

// Limits enforced by the API (generateProductSchema in studio-base-api)
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

const GenerateProduct = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [submitButton, setSubmitButton] = useState({
        isDisabled: false,
        value: "Gerar Produto",
    });

    const [titleValidation, setTitleValidation] = useState({
        isValid: true,
        message: "",
    });

    const { showSuccess, showError, showWarning } = useToast();

    const handleTitleChange = (value: string) => {
        setTitle(value);

        if (value.trim() && value.length < 3) {
            setTitleValidation({
                isValid: false,
                message: "O título deve ter pelo menos 3 caracteres",
            });
        } else if (value.length > TITLE_MAX_LENGTH) {
            setTitleValidation({
                isValid: false,
                message: `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres`,
            });
        } else {
            setTitleValidation({ isValid: true, message: "" });
        }
    };

    // Valida imagens assim que são selecionadas no uploader,
    // antes de sequer chegar ao submit — feedback imediato.
    const handleImagesChange = (newImages: File[]) => {
        if (newImages.length === 0) {
            setImages(newImages);
            return;
        }

        const validation = validateImageFiles(newImages);
        if (!validation.isValid) {
            showError(
                validation.message ?? "Uma ou mais imagens são inválidas.",
            );
            return; // não atualiza o estado, mantém a seleção anterior válida
        }

        setImages(newImages);
    };

    const handleResize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            showWarning("Selecione pelo menos uma imagem.");
            return;
        }

        if (!title.trim() || !titleValidation.isValid) {
            showWarning("Indique um título válido.");
            return;
        }

        // Segunda validação de segurança, caso o estado tenha sido
        // alterado por outra via entretanto.
        const validation = validateImageFiles(images);
        if (!validation.isValid) {
            showError(
                validation.message ?? "Uma ou mais imagens são inválidas.",
            );
            return;
        }

        try {
            setIsLoading(true);
            setSubmitButton({
                value: "A gerar...",
                isDisabled: true,
            });

            const jobId = await startProductJob(images, title.trim(), description.trim());
            await waitForJob(jobId, () => undefined);

            const { blob, filename } = await downloadProductZip(jobId);
            saveBlob(blob, filename);

            showSuccess("Produto gerado com sucesso!");
        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "Erro ao processar pedido");
        } finally {
            setIsLoading(false);
            setSubmitButton({
                value: "Gerar Produto",
                isDisabled: false,
            });
        }
    };

    return (
        <div id="generate-pdf-page">
            <div id="sub-header">
                <h1>Gerador do Produto</h1>
            </div>

            <div className="container-fluid">
                {isLoading && <LoadingSpinner isOverlay size="lg" />}

                <form onSubmit={handleResize}>
                    <div className="mb-3">
                        <Tooltip content="Selecione as imagens do produto que deseja incluir no PDF (máx. 15MB por imagem, PNG/JPEG/WEBP)">
                            <label className="form-label">Imagens</label>
                        </Tooltip>
                        <ImageUploader onChange={handleImagesChange} />
                    </div>

                    <div className="mb-3">
                        <Tooltip content="Digite o título do produto (mínimo 3 caracteres)">
                            <label htmlFor="title" className="form-label">
                                Título
                            </label>
                        </Tooltip>
                        <input
                            type="text"
                            className={`form-control ${!titleValidation.isValid ? "is-invalid" : titleValidation.isValid && title ? "is-valid" : ""}`}
                            id="title"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                        <ValidationFeedback
                            isValid={titleValidation.isValid}
                            message={titleValidation.message}
                            shouldShowValidState={false}
                        />
                    </div>

                    <div className="mb-3">
                        <Tooltip content="Digite uma descrição detalhada do produto">
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

                    <ButtonSubmit
                        isDisabled={submitButton.isDisabled}
                        description={submitButton.value}
                    />
                </form>
            </div>
        </div>
    );
};

export default GenerateProduct;

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
import { useToast } from "@hooks/useToast";

// Utils
import { validateImageFiles } from "@utils/fileValidation";

const GenerateProduct = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Gerar Produto",
    });

    const [titleValidation, setTitleValidation] = useState({
        isValid: true,
        message: "",
    });

    const { showSuccess, showError, showWarning, showInfo } = useToast();

    const handleTitleChange = (value: string) => {
        setTitle(value);

        if (value.trim() && value.length < 3) {
            setTitleValidation({
                isValid: false,
                message: "O título deve ter pelo menos 3 caracteres",
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
        if (!validation.valid) {
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

        // Segunda validação de segurança, caso o estado tenha sido
        // alterado por outra via entretanto.
        const validation = validateImageFiles(images);
        if (!validation.valid) {
            showError(
                validation.message ?? "Uma ou mais imagens são inválidas.",
            );
            return;
        }

        const formData = new FormData();
        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });
        formData.append("pdfTitle", title);
        formData.append("pdfSubject", description);

        try {
            setIsLoading(true);
            setBtnSubmit({
                value: "A gerar...",
                disabled: true,
            });

            showInfo("A gerar o produto...");

            const baseUrl = import.meta.env.VITE_API_URL;
            if (!baseUrl) {
                showError(
                    "VITE_API_URL não está configurado. Verifique o ficheiro .env.",
                );
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const endpoint = `${baseUrl}/generate-product`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Erro ao gerar produto: ${response.status} ${response.statusText}\n${errorText}`,
                );
            }

            const blob = await response.blob();

            const contentDisposition = response.headers.get(
                "Content-Disposition",
            );
            const headerFilename =
                contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
            const fallbackFilename =
                response.headers.get("X-Filename") || "output.pdf";

            const filename = headerFilename || fallbackFilename;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            showSuccess("Produto gerado com sucesso!");
        } catch (error) {
            console.error(error);
            if (error instanceof DOMException && error.name === "AbortError") {
                showError("O pedido demorou demasiado tempo (timeout de 30s).");
            } else {
                showError(
                    error instanceof Error
                        ? error.message
                        : "Erro ao processar pedido",
                );
            }
        } finally {
            setIsLoading(false);
            setBtnSubmit({
                value: "Gerar Produto",
                disabled: false,
            });
        }
    };

    return (
        <div id="generate-pdf-page">
            <div id="sub-header">
                <h1>Gerador do Produto</h1>
            </div>

            <div className="container-fluid">
                {isLoading && <LoadingSpinner overlay size="lg" />}

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
                            showValidState={false}
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
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <ButtonSubmit
                        disabled={btnSumbit.disabled}
                        description={btnSumbit.value}
                    />
                </form>
            </div>
        </div>
    );
};

export default GenerateProduct;

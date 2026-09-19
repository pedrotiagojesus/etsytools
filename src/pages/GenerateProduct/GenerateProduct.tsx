import { useEffect, useRef, useState } from "react";

// CSS
import "./GenerateProduct.css";

// Components
import ImageUploader from "@components/ImageUploader/ImageUploader";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";
import Tooltip from "@components/Tooltip/Tooltip";
import ValidationFeedback from "@components/ValidationFeedback/ValidationFeedback";
import EtsySeoPanel from "@components/GenerateProduct/EtsySeoPanel";
import PrintPreviewGrid from "@components/GenerateProduct/PrintPreviewGrid";
import DuplicateWarnings from "@components/GenerateProduct/DuplicateWarnings";
import WatermarkSamplesPanel from "@components/GenerateProduct/WatermarkSamplesPanel";

// Hooks
import { useToast } from "@hooks/useToast";

// Utils
import { validateImageFiles } from "@utils/fileValidation";
import { runGenerateProductJob, triggerBlobDownload } from "@utils/generateProductJob";

interface QueueItem {
    id: string;
    title: string;
    description: string;
    images: File[];
    status: "waiting" | "processing" | "completed" | "failed";
    error?: string;
}

const GenerateProduct = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [sampleFiles, setSampleFiles] = useState<Set<File>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [progressLabel, setProgressLabel] = useState("");

    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [processingQueue, setProcessingQueue] = useState(false);

    const cancelledRef = useRef(false);

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Gerar Produto",
    });

    const [titleValidation, setTitleValidation] = useState({
        isValid: true,
        message: "",
    });

    const { showSuccess, showError, showWarning, showInfo } = useToast();

    useEffect(() => {
        return () => {
            cancelledRef.current = true;
        };
    }, []);

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

    // Mantém a seleção de amostras alinhada com a lista de imagens (usa o
    // próprio File como chave, não o índice, porque remover uma imagem
    // desloca os índices das restantes).
    useEffect(() => {
        setSampleFiles((prev) => new Set([...prev].filter((f) => images.includes(f))));
    }, [images]);

    const toggleSampleFile = (file: File) => {
        setSampleFiles((prev) => {
            const next = new Set(prev);
            if (next.has(file)) {
                next.delete(file);
            } else if (next.size < 4) {
                next.add(file);
            }
            return next;
        });
    };

    const validateForm = (): boolean => {
        if (!images || images.length === 0) {
            showWarning("Selecione pelo menos uma imagem.");
            return false;
        }

        // Segunda validação de segurança, caso o estado tenha sido
        // alterado por outra via entretanto.
        const validation = validateImageFiles(images);
        if (!validation.valid) {
            showError(validation.message ?? "Uma ou mais imagens são inválidas.");
            return false;
        }

        return true;
    };

    const handleResize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        cancelledRef.current = false;

        try {
            setIsLoading(true);
            setProgressLabel("A iniciar...");
            setBtnSubmit({ value: "A gerar...", disabled: true });

            showInfo("A gerar o produto...");

            const { blob, filename } = await runGenerateProductJob(
                { images, title, description },
                setProgressLabel,
                () => cancelledRef.current,
            );

            triggerBlobDownload(blob, filename);
            showSuccess("Produto gerado com sucesso!");
        } catch (error) {
            if (error instanceof Error && error.message === "__cancelled__") return;

            console.error(error);
            showError(error instanceof Error ? error.message : "Erro ao processar pedido");
        } finally {
            if (!cancelledRef.current) {
                setIsLoading(false);
                setProgressLabel("");
                setBtnSubmit({ value: "Gerar Produto", disabled: false });
            }
        }
    };

    const handleAddToQueue = () => {
        if (!validateForm()) return;

        setQueue((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                title,
                description,
                images,
                status: "waiting",
            },
        ]);

        setTitle("");
        setDescription("");
        setImages([]);
        showSuccess("Produto adicionado à fila.");
    };

    const handleRemoveFromQueue = (id: string) => {
        setQueue((prev) => prev.filter((item) => item.id !== id));
    };

    const handleProcessQueue = async () => {
        setProcessingQueue(true);

        try {
            // Processa sequencialmente — reflete a natureza sequencial do
            // próprio backend (um job de cada vez) e evita ambiguidade de
            // progresso entre vários itens em simultâneo.
            for (const item of queue) {
                if (item.status !== "waiting") continue;

                setQueue((prev) =>
                    prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q)),
                );

                try {
                    const { blob, filename } = await runGenerateProductJob({
                        images: item.images,
                        title: item.title,
                        description: item.description,
                    });

                    triggerBlobDownload(blob, filename);

                    setQueue((prev) =>
                        prev.map((q) => (q.id === item.id ? { ...q, status: "completed" } : q)),
                    );
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Erro ao processar pedido";
                    setQueue((prev) =>
                        prev.map((q) => (q.id === item.id ? { ...q, status: "failed", error: message } : q)),
                    );
                }
            }

            showSuccess("Fila processada.");
        } finally {
            setProcessingQueue(false);
        }
    };

    const waitingCount = queue.filter((item) => item.status === "waiting").length;

    return (
        <div id="generate-pdf-page">
            <div id="sub-header">
                <h1>Gerador do Produto</h1>
            </div>

            <div className="container-fluid">
                {isLoading && (
                    <LoadingSpinner overlay size="lg" label={progressLabel} />
                )}

                <form onSubmit={handleResize}>
                    <div className="mb-3">
                        <Tooltip content="Selecione as imagens do produto que deseja incluir no PDF (máx. 15MB por imagem, PNG/JPEG/WEBP)">
                            <label className="form-label">Imagens</label>
                        </Tooltip>
                        <ImageUploader onChange={handleImagesChange} />
                        <PrintPreviewGrid
                            images={images}
                            selectedFiles={sampleFiles}
                            onToggleSelect={toggleSampleFile}
                            maxSelectable={4}
                        />
                        <DuplicateWarnings images={images} />
                        <WatermarkSamplesPanel images={images} selectedFiles={sampleFiles} />
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

                    <EtsySeoPanel theme={title} pageCount={images.length} />

                    <div className="d-flex gap-2 mb-3">
                        <ButtonSubmit
                            disabled={btnSumbit.disabled}
                            description={btnSumbit.value}
                        />
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleAddToQueue}
                            disabled={btnSumbit.disabled}
                        >
                            Adicionar à fila
                        </button>
                    </div>
                </form>

                {queue.length > 0 && (
                    <div className="product-queue">
                        <div className="product-queue-header">
                            <h5 className="mb-0">Fila de produtos</h5>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleProcessQueue}
                                disabled={processingQueue || waitingCount === 0}
                            >
                                {processingQueue ? "A processar..." : `Processar fila (${waitingCount})`}
                            </button>
                        </div>

                        <ul className="product-queue-list">
                            {queue.map((item, index) => (
                                <li key={item.id} className={`product-queue-item ${item.status}`}>
                                    <span className="product-queue-name">
                                        {item.title.trim() || `Produto ${index + 1}`}
                                    </span>
                                    <span className="product-queue-count">{item.images.length} imagens</span>
                                    <span className={`product-queue-status ${item.status}`}>
                                        {item.status === "waiting" && "Em espera"}
                                        {item.status === "processing" && "A processar…"}
                                        {item.status === "completed" && "Concluído"}
                                        {item.status === "failed" && `Falhou: ${item.error}`}
                                    </span>
                                    {item.status === "waiting" && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-transparent text-danger"
                                            onClick={() => handleRemoveFromQueue(item.id)}
                                            aria-label={`Remover "${item.title || `Produto ${index + 1}`}" da fila`}
                                        >
                                            <i className="bi bi-trash" aria-hidden="true"></i>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateProduct;

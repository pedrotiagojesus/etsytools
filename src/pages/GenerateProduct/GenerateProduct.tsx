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

// Hooks
import { useToast } from "@hooks/useToast";

// Utils
import { validateImageFiles } from "@utils/fileValidation";

type JobStatus = "queued" | "processing" | "completed" | "failed";

interface JobProgress {
    phase: string;
    completed: number;
    total: number;
}

interface JobStatusResponse {
    jobId: string;
    status: JobStatus;
    progress: JobProgress | null;
    error?: { message: string; statusCode: number };
}

const PHASE_LABELS: Record<string, string> = {
    "image-processing": "A processar imagens",
    "svg-vectorization": "A vetorizar",
    "svg-rasterization": "A rasterizar",
    "pdf-generation": "A gerar PDF",
    "page-images": "A gerar imagens de página",
    zip: "A compactar ficheiro",
};

const POLL_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = (
    input: string,
    init: RequestInit,
    timeoutMs: number,
) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(input, { ...init, signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId),
    );
};

const describeProgress = (progress: JobProgress | null): string => {
    if (!progress) return "A iniciar...";

    const label = PHASE_LABELS[progress.phase] ?? progress.phase;
    return progress.total > 0
        ? `${label} (${progress.completed}/${progress.total})`
        : label;
};

const GenerateProduct = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progressLabel, setProgressLabel] = useState("");

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
        formData.append("pdfDescription", description);

        const baseUrl = import.meta.env.VITE_API_URL;
        if (!baseUrl) {
            showError(
                "VITE_API_URL não está configurado. Verifique o ficheiro .env.",
            );
            return;
        }

        const apiKey = import.meta.env.VITE_IMGTOOLS_API_KEY;
        const authHeaders: HeadersInit = apiKey
            ? { "X-Api-Key": apiKey }
            : {};

        cancelledRef.current = false;

        try {
            setIsLoading(true);
            setProgressLabel("A iniciar...");
            setBtnSubmit({
                value: "A gerar...",
                disabled: true,
            });

            showInfo("A gerar o produto...");

            // 1. Cria o job — responde de imediato (202) enquanto o
            // processamento (multi-minuto) corre em background no servidor.
            const startResponse = await fetchWithTimeout(
                `${baseUrl}/imgtools/generate-product`,
                { method: "POST", body: formData, headers: authHeaders },
                120000,
            );

            if (!startResponse.ok) {
                const errorText = await startResponse.text();
                throw new Error(
                    `Erro ao iniciar a geração do produto: ${startResponse.status} ${startResponse.statusText}\n${errorText}`,
                );
            }

            const { jobId } = (await startResponse.json()) as {
                jobId: string;
            };

            // 2. Faz polling ao estado do job até terminar (completed/failed).
            let job: JobStatusResponse;
            for (;;) {
                if (cancelledRef.current) return;

                const statusResponse = await fetchWithTimeout(
                    `${baseUrl}/imgtools/generate-product/${jobId}/status`,
                    { headers: authHeaders },
                    10000,
                );

                if (!statusResponse.ok) {
                    const errorText = await statusResponse.text();
                    throw new Error(
                        `Erro ao consultar o estado do job: ${statusResponse.status} ${statusResponse.statusText}\n${errorText}`,
                    );
                }

                job = (await statusResponse.json()) as JobStatusResponse;
                setProgressLabel(describeProgress(job.progress));

                if (job.status === "completed" || job.status === "failed") {
                    break;
                }

                await sleep(POLL_INTERVAL_MS);
            }

            if (job.status === "failed") {
                throw new Error(
                    job.error?.message ?? "A geração do produto falhou.",
                );
            }

            // 3. Job concluído — descarrega o ficheiro (.zip) resultante.
            const downloadResponse = await fetchWithTimeout(
                `${baseUrl}/imgtools/generate-product/${jobId}/download`,
                { headers: authHeaders },
                30000,
            );

            if (!downloadResponse.ok) {
                const errorText = await downloadResponse.text();
                throw new Error(
                    `Erro ao descarregar o produto: ${downloadResponse.status} ${downloadResponse.statusText}\n${errorText}`,
                );
            }

            const blob = await downloadResponse.blob();

            const contentDisposition = downloadResponse.headers.get(
                "Content-Disposition",
            );
            const headerFilename =
                contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
            const fallbackFilename =
                downloadResponse.headers.get("X-Filename") || "output.zip";

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
                showError("O pedido demorou demasiado tempo (timeout).");
            } else {
                showError(
                    error instanceof Error
                        ? error.message
                        : "Erro ao processar pedido",
                );
            }
        } finally {
            if (!cancelledRef.current) {
                setIsLoading(false);
                setProgressLabel("");
                setBtnSubmit({
                    value: "Gerar Produto",
                    disabled: false,
                });
            }
        }
    };

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

import type { JobAnalysis } from "./difficulty";
import type { PaperSize } from "./paperSizes";

type JobStatus ="queued" | "processing" | "completed" | "failed";

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
    analysis?: JobAnalysis;
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

const fetchWithTimeout = (input: string, init: RequestInit, timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
};

const describeProgress = (progress: JobProgress | null): string => {
    if (!progress) return "A iniciar...";

    const label = PHASE_LABELS[progress.phase] ?? progress.phase;
    return progress.total > 0 ? `${label} (${progress.completed}/${progress.total})` : label;
};

export interface ProductOptions {
    includeTerms: boolean;
    includePrintInstructions: boolean;
    includeCoverPage: boolean;
    paperSizes: PaperSize[];
}

export const DEFAULT_PRODUCT_OPTIONS: ProductOptions = {
    includeTerms: true,
    includePrintInstructions: true,
    includeCoverPage: true,
    paperSizes: ["a4", "letter"],
};

export interface GenerateProductInput {
    images: File[];
    title: string;
    description: string;
    options: ProductOptions;
}

export interface GenerateProductJobResult {
    blob: Blob;
    filename: string;
    /** Estimativa de dificuldade; ausente se o backend não a conseguiu calcular. */
    analysis?: JobAnalysis;
}

/**
 * Cria o job de geração de produto, faz polling ao estado até terminar, e
 * descarrega o ZIP final — extraído de GenerateProduct.tsx para ser
 * reutilizável tanto pela submissão única como por cada item da fila (i15).
 * As mensagens de erro replicam exatamente o comportamento anterior.
 */
export async function runGenerateProductJob(
    input: GenerateProductInput,
    onProgress?: (label: string) => void,
    isCancelled?: () => boolean,
): Promise<GenerateProductJobResult> {
    const formData = new FormData();
    input.images.forEach((image) => {
        formData.append("images", image);
    });
    formData.append("pdfTitle", input.title);
    formData.append("pdfDescription", input.description);
    formData.append("includeTerms", String(input.options.includeTerms));
    formData.append("includePrintInstructions", String(input.options.includePrintInstructions));
    formData.append("includeCoverPage", String(input.options.includeCoverPage));
    formData.append("paperSizes", input.options.paperSizes.join(","));

    const baseUrl = import.meta.env.VITE_API_URL;
    if (!baseUrl) {
        throw new Error("VITE_API_URL não está configurado. Verifique o ficheiro .env.");
    }

    const apiKey = import.meta.env.VITE_IMGTOOLS_API_KEY;
    const authHeaders: HeadersInit = apiKey ? { "X-Api-Key": apiKey } : {};

    try {
        onProgress?.("A iniciar...");

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

        const { jobId } = (await startResponse.json()) as { jobId: string };

        // 2. Faz polling ao estado do job até terminar (completed/failed).
        let job: JobStatusResponse;
        for (;;) {
            if (isCancelled?.()) throw new Error("__cancelled__");

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
            onProgress?.(describeProgress(job.progress));

            if (job.status === "completed" || job.status === "failed") {
                break;
            }

            await sleep(POLL_INTERVAL_MS);
        }

        if (job.status === "failed") {
            throw new Error(job.error?.message ?? "A geração do produto falhou.");
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

        const contentDisposition = downloadResponse.headers.get("Content-Disposition");
        const headerFilename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
        const fallbackFilename = downloadResponse.headers.get("X-Filename") || "output.zip";
        const filename = headerFilename || fallbackFilename;

        // A análise só existe no `status` (o backend remove o job depois do
        // download), por isso é lida do último estado, antes de descarregar.
        return { blob, filename, analysis: job.analysis };
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("O pedido demorou demasiado tempo (timeout).");
        }
        throw error;
    }
}

export const triggerBlobDownload = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

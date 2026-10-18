import type { PaperSize } from "@utils/paper-sizes";
import { blobToDataUrl } from "@utils/download-files";

/**
 * Client for the studio-base-api `/imgtools/generate-product` routes.
 * The backend is the source of truth: these types mirror its responses
 * (see src/modules/imgtools in ../studio-base-api).
 */

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type JobPhase =
    | "image-processing"
    | "svg-vectorization"
    | "pdf-generation"
    | "page-images"
    | "zip";

export interface JobProgress {
    phase: JobPhase;
    completed: number;
    total: number;
}

export interface JobStatusResponse {
    jobId: string;
    status: JobStatus;
    progress: JobProgress | null;
    error?: { message: string; statusCode: number };
    pageCount: number | null;
    resultSizeBytes: number | null;
}

export interface ProductJobOptions {
    title: string;
    description: string;
    // Vectorization luminance cut-off (1-254); higher keeps thicker lines
    threshold: number;
    hasCoverPage: boolean;
    // One PDF per size in the ZIP (at least one)
    paperSizes: PaperSize[];
    // Closing PDF page; empty = no page
    termsText: string;
}

export const DEFAULT_VECTORIZE_THRESHOLD = 220;

interface StartJobResponse {
    jobId: string;
    statusUrl: string;
}

interface ApiErrorResponse {
    status: "error";
    message: string;
    requestId?: string;
}

// A processed page: full resolution PNG and a small preview, both data URLs
export interface ProductPage {
    image: string;
    thumbnail: string;
}

export interface DownloadedFile {
    blob: Blob;
    filename: string;
}

const POLL_INTERVAL_MS = 1500;

const getConfig = (): { baseUrl: string; apiKey: string } => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_IMGTOOLS_API_KEY;

    if (!baseUrl || !apiKey) {
        throw new Error("VITE_API_URL e VITE_IMGTOOLS_API_KEY têm de estar no ficheiro .env.");
    }

    return { baseUrl, apiKey };
};

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
    typeof value === "object" && value !== null && "message" in value && typeof value.message === "string";

const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const { baseUrl, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/imgtools/generate-product${path}`, {
        ...init,
        headers: { "X-Api-Key": apiKey },
    });

    if (response.ok) return response;

    const body: unknown = await response.json().catch(() => null);
    const message = isApiErrorResponse(body) ? body.message : `Erro ${response.status} na API`;
    throw new Error(message);
};

const wait = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            window.clearTimeout(timeoutId);
            reject(new DOMException("Pedido cancelado", "AbortError"));
        });
    });

/**
 * Uploads the images and starts the product job. Returns the job id.
 */
export const startProductJob = async (images: File[], options: ProductJobOptions): Promise<string> => {
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));
    formData.append("pdfTitle", options.title);
    formData.append("pdfDescription", options.description);
    formData.append("threshold", String(options.threshold));
    formData.append("hasCoverPage", String(options.hasCoverPage));
    formData.append("paperSizes", options.paperSizes.join(","));
    formData.append("termsText", options.termsText);

    const response = await request("", { method: "POST", body: formData });
    const body: StartJobResponse = await response.json();

    return body.jobId;
};

export const getJobStatus = async (jobId: string, signal?: AbortSignal): Promise<JobStatusResponse> => {
    const response = await request(`/${jobId}/status`, { signal });
    return response.json();
};

/**
 * Polls the job until it finishes. Resolves with the final status when it
 * completes and throws with the API's message when it fails.
 */
export const waitForJob = async (
    jobId: string,
    onProgress: (status: JobStatusResponse) => void,
    signal?: AbortSignal,
): Promise<JobStatusResponse> => {
    for (;;) {
        const status = await getJobStatus(jobId, signal);
        onProgress(status);

        if (status.status === "completed") return status;
        if (status.status === "failed") {
            throw new Error(status.error?.message ?? "O processamento falhou.");
        }

        await wait(POLL_INTERVAL_MS, signal);
    }
};

/**
 * Vectorizes one image with the given threshold, like the job does, and
 * returns the SVG as a Blob (to show a before/after comparison).
 */
export const previewVectorization = async (image: File, threshold: number): Promise<Blob> => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("threshold", String(threshold));

    const response = await request("/preview", { method: "POST", body: formData });
    return response.blob();
};

/**
 * Downloads the product ZIP (PDF + page images) of a completed job.
 */
export const downloadProductZip = async (jobId: string): Promise<DownloadedFile> => {
    const response = await request(`/${jobId}/download`);
    const contentDisposition = response.headers.get("Content-Disposition");
    const filename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ?? "produto.zip";

    return { blob: await response.blob(), filename };
};

/**
 * Fetches one processed page (1-based) as a PNG data URL.
 */
export const fetchPageImage = async (jobId: string, page: number): Promise<string> => {
    const response = await request(`/${jobId}/pages/${page}`);
    return blobToDataUrl(await response.blob());
};

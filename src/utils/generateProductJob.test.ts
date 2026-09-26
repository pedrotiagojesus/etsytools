import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRODUCT_OPTIONS, runGenerateProductJob } from "./generateProductJob";
import type { JobAnalysis } from "./difficulty";

const analysis: JobAnalysis = {
    overall: "easy",
    pages: [{ index: 1, difficulty: "easy", score: 0.2, metrics: { regions: 5, segments: 50, inkRatio: 0.05 } }],
};

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("runGenerateProductJob", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    const mockSuccessfulJob = (statusBody: Record<string, unknown>) => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({ jobId: "job-1" }, 202))
            .mockResolvedValueOnce(jsonResponse({ jobId: "job-1", status: "completed", progress: null, ...statusBody }))
            .mockResolvedValueOnce(
                new Response("zip-bytes", { headers: { "Content-Disposition": 'attachment; filename="produto.zip"' } }),
            );
    };

    it("envia as opções do produto no FormData", async () => {
        mockSuccessfulJob({});

        await runGenerateProductJob({
            images: [new File(["x"], "a.png", { type: "image/png" })],
            title: "Ocean",
            description: "desc",
            options: {
                includeTerms: true,
                includePrintInstructions: false,
                includeCoverPage: true,
                paperSizes: ["a4", "letter"],
            },
        });

        const body = fetchMock.mock.calls[0][1].body as FormData;
        expect(body.get("pdfTitle")).toBe("Ocean");
        expect(body.get("includeTerms")).toBe("true");
        expect(body.get("includePrintInstructions")).toBe("false");
        expect(body.get("includeCoverPage")).toBe("true");
        expect(body.get("paperSizes")).toBe("a4,letter");
        expect(body.getAll("images")).toHaveLength(1);
    });

    it("devolve a análise de dificuldade lida do status", async () => {
        mockSuccessfulJob({ analysis });

        const result = await runGenerateProductJob({
            images: [new File(["x"], "a.png", { type: "image/png" })],
            title: "Ocean",
            description: "",
            options: DEFAULT_PRODUCT_OPTIONS,
        });

        expect(result.analysis).toEqual(analysis);
        expect(result.filename).toBe("produto.zip");
    });

    it("devolve analysis undefined quando o backend não a envia", async () => {
        mockSuccessfulJob({});

        const result = await runGenerateProductJob({
            images: [new File(["x"], "a.png", { type: "image/png" })],
            title: "Ocean",
            description: "",
            options: DEFAULT_PRODUCT_OPTIONS,
        });

        expect(result.analysis).toBeUndefined();
    });
});

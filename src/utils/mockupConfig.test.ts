import { describe, expect, it } from "vitest";
import { buildProductConfig, buildSlideConfig, readMockupConfigFile } from "./mockupConfig";

const makeFile = (content: unknown): File =>
    new File([JSON.stringify(content)], "config.json", { type: "application/json" });

describe("buildSlideConfig / buildProductConfig", () => {
    it("constrói patternStyles a partir do patternCssList, indexado por posição", () => {
        const slide = buildSlideConfig("Capa", "main", "<div></div>", "body{}", ["dots", ""], [".dots{}", ""]);

        expect(slide.patternStyles).toEqual({ "pattern-style-0": ".dots{}" });
        expect(slide.activePatterns).toEqual(["dots", ""]);
    });

    it("agrupa vários slides num ProductConfig v2", () => {
        const slide1 = buildSlideConfig("Capa", "main", "<a/>", "", [], []);
        const slide2 = buildSlideConfig("Exemplos", "secondary", "<b/>", "", [], []);

        const config = buildProductConfig([slide1, slide2]);

        expect(config.version).toBe(2);
        expect(config.slides).toHaveLength(2);
        expect(config.slides[0].name).toBe("Capa");
        expect(config.slides[1].name).toBe("Exemplos");
    });
});

describe("readMockupConfigFile", () => {
    it("lê um ficheiro v2 diretamente, sem alterações", async () => {
        const file = makeFile({
            version: 2,
            exportedAt: "2026-01-01T00:00:00.000Z",
            slides: [
                {
                    name: "Capa",
                    template: "main",
                    previewHtml: "<div></div>",
                    previewCss: "",
                    patternStyles: {},
                    activePatterns: [],
                },
            ],
        });

        const config = await readMockupConfigFile(file);

        expect(config.version).toBe(2);
        expect(config.slides).toHaveLength(1);
        expect(config.slides[0].name).toBe("Capa");
    });

    it("migra um ficheiro v1 (um único mockup) para v2 (um slide)", async () => {
        const file = makeFile({
            version: 1,
            template: "main",
            previewHtml: "<div>old</div>",
            previewCss: "body{}",
            patternStyles: { "pattern-style-0": ".x{}" },
            activePatterns: ["x"],
            exportedAt: "2025-01-01T00:00:00.000Z",
        });

        const config = await readMockupConfigFile(file);

        expect(config.version).toBe(2);
        expect(config.slides).toHaveLength(1);
        expect(config.slides[0]).toMatchObject({
            name: "Slide 1",
            template: "main",
            previewHtml: "<div>old</div>",
            previewCss: "body{}",
            patternStyles: { "pattern-style-0": ".x{}" },
            activePatterns: ["x"],
        });
    });

    it("rejeita uma versão não suportada", async () => {
        const file = makeFile({ version: 3, slides: [] });

        await expect(readMockupConfigFile(file)).rejects.toThrow(/versão/i);
    });

    it("rejeita um v2 sem lista de slides", async () => {
        const file = makeFile({ version: 2, slides: [] });

        await expect(readMockupConfigFile(file)).rejects.toThrow(/slides/i);
    });

    it("rejeita JSON que não é um objeto", async () => {
        const file = makeFile("apenas uma string");

        await expect(readMockupConfigFile(file)).rejects.toThrow();
    });
});

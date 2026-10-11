import { DEFAULT_MOCKUP_TEMPLATE, duplicateSlide, extractInlineImages } from "@utils/mockup-slides";
import type { MockupSlide } from "@utils/mockup-slides";
import { saveBlob } from "@utils/download-files";

type ConfigSlide = Omit<MockupSlide, "id">;

// Version 3 stores each slide's images apart from its HTML
export interface MockupConfig {
    version: 3;
    slides: ConfigSlide[];
    exportedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toStringRecord = (value: unknown): Record<string, string> =>
    isRecord(value)
        ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : {};

const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : "")) : [];

const parseSlide = (value: unknown, position: number): ConfigSlide => {
    if (!isRecord(value) || typeof value.html !== "string" || typeof value.css !== "string") {
        throw new Error(`Ficheiro inválido: o slide ${position} não tem html/css.`);
    }

    const { html, images } = extractInlineImages({ html: value.html, images: toStringRecord(value.images) });

    return {
        template: typeof value.template === "string" ? value.template : DEFAULT_MOCKUP_TEMPLATE,
        html,
        css: value.css,
        activePatterns: toStringArray(value.activePatterns),
        patternCssList: toStringArray(value.patternCssList),
        images,
    };
};

/**
 * Version 1 files held a single mockup, with pattern CSS keyed by the
 * <style> id ("pattern-style-N").
 */
const parseVersion1 = (parsed: Record<string, unknown>): ConfigSlide => {
    if (typeof parsed.previewHtml !== "string" || typeof parsed.previewCss !== "string") {
        throw new Error("Ficheiro inválido: faltam previewHtml/previewCss.");
    }

    const activePatterns = toStringArray(parsed.activePatterns);
    const patternStyles = isRecord(parsed.patternStyles) ? parsed.patternStyles : {};
    const patternCssList = activePatterns.map((_, index) => {
        const css = patternStyles[`pattern-style-${index}`];
        return typeof css === "string" ? css : "";
    });

    const { html, images } = extractInlineImages({ html: parsed.previewHtml, images: {} });

    return {
        template: typeof parsed.template === "string" ? parsed.template : DEFAULT_MOCKUP_TEMPLATE,
        html,
        css: parsed.previewCss,
        activePatterns,
        patternCssList,
        images,
    };
};

export const buildMockupConfig = (slides: MockupSlide[]): MockupConfig => ({
    version: 3,
    slides: slides.map(({ template, html, css, activePatterns, patternCssList, images }) => ({
        template,
        html,
        css,
        activePatterns,
        patternCssList,
        images,
    })),
    exportedAt: new Date().toISOString(),
});

export const downloadMockupConfig = (config: MockupConfig, filename = "mockup-config"): void => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    saveBlob(blob, `${filename}.json`);
};

/**
 * Reads a configuration file (version 1, 2 or 3) and returns its slides.
 * Throws with a readable message when the file is malformed.
 */
export const readMockupConfigFile = async (file: File): Promise<MockupSlide[]> => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(await file.text());
    } catch {
        throw new Error("Ficheiro inválido: não é JSON.");
    }

    if (!isRecord(parsed)) {
        throw new Error("Ficheiro inválido: não é um objeto JSON.");
    }

    let slides: ConfigSlide[];
    if (parsed.version === 1) {
        slides = [parseVersion1(parsed)];
    } else if ((parsed.version === 2 || parsed.version === 3) && Array.isArray(parsed.slides)) {
        slides = parsed.slides.map((slide, index) => parseSlide(slide, index + 1));
    } else {
        throw new Error(`Versão de configuração não suportada: ${String(parsed.version)}`);
    }

    if (slides.length === 0) {
        throw new Error("Ficheiro inválido: não tem slides.");
    }

    // duplicateSlide gives each imported slide a fresh id
    return slides.map((slide) => duplicateSlide({ ...slide, id: "" }));
};

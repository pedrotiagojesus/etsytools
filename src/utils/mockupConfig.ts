export interface MockupSlideConfig {
    name: string;
    template: string;
    previewHtml: string;
    previewCss: string;
    patternStyles: Record<string, string>; // { "pattern-style-0": "...css..." }
    activePatterns: string[]; // nomes dos padrões ativos, por índice
}

export interface ProductConfig {
    version: 2;
    slides: MockupSlideConfig[];
    exportedAt: string;
}

/** Formato antigo (um único mockup, sem lista de slides) — mantido só para migração. */
interface MockupConfigV1 {
    version: 1;
    template: string;
    previewHtml: string;
    previewCss: string;
    patternStyles: Record<string, string>;
    activePatterns: string[];
    exportedAt: string;
}

const buildPatternStyles = (patternCssList: string[]): Record<string, string> => {
    const styles: Record<string, string> = {};
    patternCssList.forEach((css, index) => {
        if (css) styles[`pattern-style-${index}`] = css;
    });
    return styles;
};

export const buildSlideConfig = (
    name: string,
    template: string,
    previewHtml: string,
    previewCss: string,
    activePatterns: string[],
    patternCssList: string[],
): MockupSlideConfig => ({
    name,
    template,
    previewHtml,
    previewCss,
    patternStyles: buildPatternStyles(patternCssList),
    activePatterns,
});

export const buildProductConfig = (slides: MockupSlideConfig[]): ProductConfig => ({
    version: 2,
    slides,
    exportedAt: new Date().toISOString(),
});

export const downloadMockupConfig = (
    config: ProductConfig,
    filename = "produto-etsy",
) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

const parseSlideConfig = (raw: unknown, index: number): MockupSlideConfig => {
    if (!raw || typeof raw !== "object") {
        throw new Error(`Slide ${index + 1} inválido: não é um objeto.`);
    }
    const slide = raw as Record<string, unknown>;

    if (typeof slide.previewHtml !== "string" || typeof slide.previewCss !== "string") {
        throw new Error(`Slide ${index + 1} inválido: faltam previewHtml/previewCss.`);
    }

    return {
        name: typeof slide.name === "string" && slide.name ? slide.name : `Slide ${index + 1}`,
        template: typeof slide.template === "string" ? slide.template : "main",
        previewHtml: slide.previewHtml,
        previewCss: slide.previewCss,
        patternStyles:
            slide.patternStyles && typeof slide.patternStyles === "object"
                ? (slide.patternStyles as Record<string, string>)
                : {},
        activePatterns: Array.isArray(slide.activePatterns) ? (slide.activePatterns as string[]) : [],
    };
};

/**
 * Converte um ficheiro de configuração antigo (v1, um único mockup) para o
 * formato atual (v2, lista de slides) — para não invalidar exports feitos
 * antes desta funcionalidade existir.
 */
const migrateV1ToV2 = (v1: MockupConfigV1): ProductConfig => ({
    version: 2,
    exportedAt: v1.exportedAt,
    slides: [
        {
            name: "Slide 1",
            template: v1.template,
            previewHtml: v1.previewHtml,
            previewCss: v1.previewCss,
            patternStyles: v1.patternStyles,
            activePatterns: v1.activePatterns,
        },
    ],
});

/**
 * Lê e valida um ficheiro JSON de configuração (v1 ou v2 — v1 é migrado
 * automaticamente). Lança erro com mensagem legível se algo estiver mal
 * formado.
 */
export const readMockupConfigFile = (file: File): Promise<ProductConfig> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result as string);

                if (!parsed || typeof parsed !== "object") {
                    throw new Error("Ficheiro inválido: não é um objeto JSON.");
                }

                if (parsed.version === 1) {
                    if (typeof parsed.previewHtml !== "string" || typeof parsed.previewCss !== "string") {
                        throw new Error("Ficheiro inválido: faltam previewHtml/previewCss.");
                    }
                    resolve(
                        migrateV1ToV2({
                            version: 1,
                            template: parsed.template ?? "main",
                            previewHtml: parsed.previewHtml,
                            previewCss: parsed.previewCss,
                            patternStyles: parsed.patternStyles ?? {},
                            activePatterns: Array.isArray(parsed.activePatterns) ? parsed.activePatterns : [],
                            exportedAt: parsed.exportedAt ?? "",
                        }),
                    );
                    return;
                }

                if (parsed.version !== 2) {
                    throw new Error(`Versão de configuração não suportada: ${parsed.version}`);
                }

                if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
                    throw new Error("Ficheiro inválido: falta a lista de slides.");
                }

                resolve({
                    version: 2,
                    slides: parsed.slides.map((slide: unknown, index: number) => parseSlideConfig(slide, index)),
                    exportedAt: parsed.exportedAt ?? "",
                });
            } catch (err) {
                reject(
                    err instanceof Error
                        ? err
                        : new Error("Erro ao ler o ficheiro de configuração."),
                );
            }
        };

        reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
        reader.readAsText(file);
    });
};

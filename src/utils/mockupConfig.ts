export interface MockupConfig {
    version: 1;
    template: string;
    previewHtml: string;
    previewCss: string;
    patternStyles: Record<string, string>; // { "pattern-style-0": "...css..." }
    activePatterns: string[]; // nomes dos padrões ativos, por índice
    exportedAt: string;
}

/**
 * Recolhe o CSS de todos os <style id="pattern-style-N"> injetados no DOM.
 */
const collectPatternStyles = (): Record<string, string> => {
    const styles: Record<string, string> = {};
    document.querySelectorAll('style[id^="pattern-style-"]').forEach((el) => {
        styles[el.id] = el.innerHTML;
    });
    return styles;
};

export const buildMockupConfig = (
    template: string,
    previewHtml: string,
    previewCss: string,
    activePatterns: string[],
): MockupConfig => ({
    version: 1,
    template,
    previewHtml,
    previewCss,
    patternStyles: collectPatternStyles(),
    activePatterns,
    exportedAt: new Date().toISOString(),
});

export const downloadMockupConfig = (config: MockupConfig, filename = "mockup-config") => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Lê e valida um ficheiro JSON de configuração.
 * Lança erro com mensagem legível se algo estiver mal formado.
 */
export const readMockupConfigFile = (file: File): Promise<MockupConfig> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result as string);

                if (!parsed || typeof parsed !== "object") {
                    throw new Error("Ficheiro inválido: não é um objeto JSON.");
                }
                if (parsed.version !== 1) {
                    throw new Error(`Versão de configuração não suportada: ${parsed.version}`);
                }
                if (typeof parsed.previewHtml !== "string" || typeof parsed.previewCss !== "string") {
                    throw new Error("Ficheiro inválido: faltam previewHtml/previewCss.");
                }

                resolve({
                    version: 1,
                    template: parsed.template ?? "main",
                    previewHtml: parsed.previewHtml,
                    previewCss: parsed.previewCss,
                    patternStyles: parsed.patternStyles ?? {},
                    activePatterns: Array.isArray(parsed.activePatterns) ? parsed.activePatterns : [],
                    exportedAt: parsed.exportedAt ?? "",
                });
            } catch (err) {
                reject(err instanceof Error ? err : new Error("Erro ao ler o ficheiro de configuração."));
            }
        };

        reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
        reader.readAsText(file);
    });
};

// Dynamic imports — o Vite trata estes .css exatamente como trataria
// um import estático, incluindo a reescrita correta dos url() internos.
const fontModules = import.meta.glob("/src/assets/fonts/*/*.css");

const loadedFonts = new Set<string>();

const normalize = (name: string) =>
    name.replace(/["']/g, "").trim().toLowerCase().replace(/\s+/g, "");

/**
 * Carrega o CSS (@font-face) de uma fonte específica pelo nome, uma única vez.
 * O nome deve corresponder (case-insensitive, sem espaços) ao nome da pasta
 * em src/assets/fonts/<nome>/.
 */
export const loadFont = async (fontName: string): Promise<void> => {
    const key = normalize(fontName);
    if (loadedFonts.has(key)) return;

    const match = Object.keys(fontModules).find((path) => {
        const folder = path.split("/").slice(-2, -1)[0];
        return normalize(folder) === key;
    });

    if (!match) return; // fonte não disponível localmente (ex: "sans-serif", "Impact")

    try {
        await fontModules[match](); // efeito colateral: injeta o <style>/chunk CSS correto
        loadedFonts.add(key);
    } catch (err) {
        console.error(`Erro ao carregar a fonte "${fontName}":`, err);
    }
};

/**
 * Extrai todos os font-family usados num bloco de CSS (incluindo fallbacks)
 * e despoleta o carregamento de cada um.
 */
export const loadFontsFromCss = (css: string): void => {
    if (!css) return;

    const regex = /font-family:\s*([^;}]+)/g;
    const names = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = regex.exec(css)) !== null) {
        match[1]
            .split(",")
            .map((f) => f.replace(/["']/g, "").trim())
            .filter(Boolean)
            .forEach((f) => names.add(f));
    }

    names.forEach((name) => loadFont(name));
};

/**
 * Lista todas as fontes disponíveis (nomes das pastas), sem as carregar.
 */
export const listAvailableFonts = (): string[] => {
    const folderNames = new Set<string>();
    Object.keys(fontModules).forEach((path) => {
        const folder = path.split("/").slice(-2, -1)[0];
        folderNames.add(folder);
    });
    return Array.from(folderNames).sort();
};
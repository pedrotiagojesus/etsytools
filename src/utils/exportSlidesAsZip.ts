import JSZip from "jszip";
import { toJpeg } from "html-to-image";
import injectPatternStyle from "@utils/injectPatternStyle";
import type { Slide } from "@hooks/useMockupEditor";

export interface ExportProgress {
    current: number;
    total: number;
    slideName: string;
}

export interface ExportResult {
    ok: string[];
    failed: { name: string; error: string }[];
}

const slugify = (name: string): string =>
    name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "slide";

/**
 * Renderiza e captura cada slide fora do ecrã (o preview visível tem um
 * TransformWrapper de zoom/pan só para interação — a captura precisa do
 * conteúdo "limpo", sem essa transformação), e empacota tudo num único ZIP.
 * Uma falha num slide não aborta os restantes — fica registada em `failed`.
 */
export const exportSlidesAsZip = async (
    slides: Slide[],
    onProgress?: (progress: ExportProgress) => void,
): Promise<ExportResult> => {
    // position:fixed + top/left:0 (em vez de deslocado para muito longe do
    // ecrã) — offsets muito grandes fazem o html-to-image rasterizar em
    // branco (as coordenadas do foreignObject saem fora da área capturada).
    // z-index negativo mantém o conteúdo visualmente escondido atrás do
    // resto da página sem sair das coordenadas do viewport.
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "-1";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    const styleTag = document.createElement("style");
    styleTag.id = "mockup-export-style";
    document.head.appendChild(styleTag);

    const zip = new JSZip();
    const ok: string[] = [];
    const failed: ExportResult["failed"] = [];

    try {
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            onProgress?.({ current: i + 1, total: slides.length, slideName: slide.name });

            try {
                container.innerHTML = slide.previewHtml;
                styleTag.textContent = slide.previewCss ?? "";

                slide.patternCssList.forEach((css, patternIndex) => {
                    if (css) injectPatternStyle(css, `pattern-style-${patternIndex}`);
                });

                // Espera dois frames para o browser aplicar estilos/imagens
                // antes de capturar (mesma margem de segurança que qualquer
                // captura de DOM baseada em html-to-image precisa).
                await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                const dataUrl = await toJpeg(container, { quality: 0.95, backgroundColor: "#ffffff" });
                const base64 = dataUrl.split(",")[1] ?? "";
                const filename = `${String(i + 1).padStart(2, "0")}-${slugify(slide.name)}.jpg`;

                zip.file(filename, base64, { base64: true });
                ok.push(slide.name);
            } catch (err) {
                failed.push({ name: slide.name, error: err instanceof Error ? err.message : String(err) });
            }
        }
    } finally {
        container.remove();
        styleTag.remove();
    }

    if (ok.length > 0) {
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "imagens-produto.zip";
        a.click();
        URL.revokeObjectURL(url);
    }

    return { ok, failed };
};

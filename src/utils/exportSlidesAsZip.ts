import JSZip from "jszip";
import { toJpeg } from "html-to-image";
import injectPatternStyle from "@utils/injectPatternStyle";
import { checkImageSpecs } from "@utils/etsyImageSpecs";
import { applyWatermarkToDataUrl } from "@utils/watermark";
import { loadFontsFromCss } from "@utils/loadFonts";
import type { Slide } from "@hooks/useMockupEditor";

export interface ExportProgress {
    current: number;
    total: number;
    slideName: string;
}

export interface SpecWarning {
    name: string;
    width: number;
    height: number;
    severity: "low" | "high";
    message: string;
}

export interface ExportResult {
    ok: string[];
    failed: { name: string; error: string }[];
    specWarnings: SpecWarning[];
}

const getDataUrlDimensions = (dataUrl: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("Não foi possível ler as dimensões da imagem exportada"));
        img.src = dataUrl;
    });

const buildSpecWarning = (name: string, width: number, height: number): SpecWarning | null => {
    const check = checkImageSpecs(width, height);

    if (check.belowAbsoluteMinimum) {
        return {
            name,
            width,
            height,
            severity: "high",
            message: "abaixo do mínimo absoluto do Etsy (635px) — o Etsy despromove esta imagem na pesquisa",
        };
    }

    if (!check.meetsZoomMinimum) {
        return {
            name,
            width,
            height,
            severity: "low",
            message: "abaixo do recomendado para zoom completo (2000px)",
        };
    }

    if (!check.aspectRatioOk) {
        return {
            name,
            width,
            height,
            severity: "low",
            message: "proporção fora do recomendado pelo Etsy (1:1 ou 4:3)",
        };
    }

    return null;
};

export const slugify = (name: string): string =>
    name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "slide";

/**
 * Desativa as tags <style> dos previews (o slide ativo no editor, etc.)
 * enquanto se exporta. Os templates partilham nomes de classe, por isso o CSS
 * do slide que está aberto no editor "vazaria" para a captura dos outros
 * slides em tudo o que o template exportado não redefine (ex: um flex-direction
 * herdado de outro template). Devolve a função que os volta a ativar.
 */
export const isolateExportStyles = (): (() => void) => {
    const previewStyles = Array.from(document.querySelectorAll<HTMLStyleElement>('style[id^="mockup-style-"]'));
    previewStyles.forEach((style) => {
        if (style.sheet) style.sheet.disabled = true;
    });

    return () => {
        previewStyles.forEach((style) => {
            if (style.sheet) style.sheet.disabled = false;
        });
    };
};

/**
 * Monta um slide num container offscreen já preparado (innerHTML + CSS +
 * padrões) e captura-o como dataURL — extraído para ser reaproveitado por
 * qualquer exportação que precise da imagem "limpa" de um slide (ex:
 * formatos de redes sociais, que depois recortam este resultado).
 */
export const captureSlideAsDataUrl = async (
    container: HTMLDivElement,
    styleTag: HTMLStyleElement,
    slide: Slide,
): Promise<string> => {
    container.innerHTML = slide.previewHtml;
    styleTag.textContent = slide.previewCss ?? "";

    slide.patternCssList.forEach((css, patternIndex) => {
        if (css) injectPatternStyle(css, `pattern-style-${patternIndex}`);
    });

    // Um slide que nunca foi aberto no editor ainda não teve as suas fontes
    // carregadas (só o slide ativo as carrega) — sem isto, sairia na fonte de
    // recurso em vez da do template.
    await loadFontsFromCss(slide.previewCss);

    // Espera dois frames para o browser aplicar estilos/imagens antes de
    // capturar (mesma margem de segurança que qualquer captura de DOM
    // baseada em html-to-image precisa).
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;

    return toJpeg(container, { quality: 0.95, backgroundColor: "#ffffff" });
};

/**
 * Renderiza e captura cada slide fora do ecrã (o preview visível tem um
 * TransformWrapper de zoom/pan só para interação — a captura precisa do
 * conteúdo "limpo", sem essa transformação), e empacota tudo num único ZIP.
 * Uma falha num slide não aborta os restantes — fica registada em `failed`.
 */
export const exportSlidesAsZip = async (
    slides: Slide[],
    onProgress?: (progress: ExportProgress) => void,
    watermarkText?: string,
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
    const restorePreviewStyles = isolateExportStyles();

    const zip = new JSZip();
    const ok: string[] = [];
    const failed: ExportResult["failed"] = [];
    const specWarnings: SpecWarning[] = [];

    try {
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            onProgress?.({ current: i + 1, total: slides.length, slideName: slide.name });

            try {
                const captured = await captureSlideAsDataUrl(container, styleTag, slide);
                const dataUrl = watermarkText ? await applyWatermarkToDataUrl(captured, watermarkText) : captured;
                const base64 = dataUrl.split(",")[1] ?? "";
                const filename = `${String(i + 1).padStart(2, "0")}-${slugify(slide.name)}.jpg`;

                zip.file(filename, base64, { base64: true });
                ok.push(slide.name);

                try {
                    const { width, height } = await getDataUrlDimensions(dataUrl);
                    const warning = buildSpecWarning(slide.name, width, height);
                    if (warning) specWarnings.push(warning);
                } catch (err) {
                    console.error("Não foi possível verificar as specs de imagem do Etsy:", err);
                }
            } catch (err) {
                failed.push({ name: slide.name, error: err instanceof Error ? err.message : String(err) });
            }
        }
    } finally {
        restorePreviewStyles();
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

    return { ok, failed, specWarnings };
};

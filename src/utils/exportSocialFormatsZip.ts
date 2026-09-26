import JSZip from "jszip";
import { captureSlideAsDataUrl, isolateExportStyles, slugify, type ExportProgress } from "@utils/exportSlidesAsZip";
import { cropDataUrlToFormat, SOCIAL_FORMATS } from "@utils/socialFormats";
import { applyWatermarkToDataUrl } from "@utils/watermark";
import type { Slide } from "@hooks/useMockupEditor";

export interface SocialExportResult {
    ok: string[];
    failed: { name: string; error: string }[];
}

/**
 * Reaproveita a mesma captura offscreen de slide já usada em
 * exportSlidesAsZip.ts, mas recorta o resultado para os formatos de redes
 * sociais (Pinterest, Instagram) em vez de exportar o tamanho nativo.
 */
export const exportSocialFormatsZip = async (
    slides: Slide[],
    onProgress?: (progress: ExportProgress) => void,
    watermarkText?: string,
): Promise<SocialExportResult> => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "-1";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    const styleTag = document.createElement("style");
    styleTag.id = "mockup-social-export-style";
    document.head.appendChild(styleTag);
    const restorePreviewStyles = isolateExportStyles();

    const zip = new JSZip();
    const ok: string[] = [];
    const failed: SocialExportResult["failed"] = [];

    try {
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            onProgress?.({ current: i + 1, total: slides.length, slideName: slide.name });

            try {
                const dataUrl = await captureSlideAsDataUrl(container, styleTag, slide);

                for (const format of SOCIAL_FORMATS) {
                    const cropped = await cropDataUrlToFormat(dataUrl, format.width, format.height);
                    // Depois do recorte, para a marca de água ter o tamanho certo no formato final.
                    const finalImage = watermarkText ? await applyWatermarkToDataUrl(cropped, watermarkText) : cropped;
                    const base64 = finalImage.split(",")[1] ?? "";
                    const filename = `${String(i + 1).padStart(2, "0")}-${slugify(slide.name)}-${format.key}.jpg`;
                    zip.file(filename, base64, { base64: true });
                }

                ok.push(slide.name);
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
        a.download = "imagens-redes-sociais.zip";
        a.click();
        URL.revokeObjectURL(url);
    }

    return { ok, failed };
};

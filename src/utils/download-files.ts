import { toBlob, toJpeg } from "html-to-image";

const WHITE_BACKGROUND = "#ffffff";

const getElement = (elementId: string): HTMLElement => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
    }
    return element;
};

/**
 * Renderiza um elemento HTML como imagem PNG ou JPEG e devolve o Blob.
 *
 * @throws Se o elemento não existir ou a imagem não puder ser gerada
 */
export const renderElementToBlob = async (elementId: string, format: "png" | "jpeg" = "png"): Promise<Blob> => {
    const element = getElement(elementId);
    const blob =
        format === "jpeg"
            ? await fetch(await toJpeg(element, { quality: 0.95, backgroundColor: WHITE_BACKGROUND })).then((res) =>
                  res.blob(),
              )
            : await toBlob(element, { backgroundColor: WHITE_BACKGROUND });

    if (!blob) {
        throw new Error("Não foi possível gerar a imagem.");
    }
    return blob;
};

/**
 * Faz o download de um elemento HTML renderizado como imagem PNG ou JPEG.
 *
 * @param elementId - ID do elemento HTML (ex: "preview-display")
 * @param fileName - Nome do ficheiro de saída, sem extensão
 * @param format - Formato da imagem ("png" | "jpeg")
 * @throws Se o elemento não existir ou a imagem não puder ser gerada
 */
const downloadHtmlAsImage = async (
    elementId: string,
    fileName: string = "mockup",
    format: "png" | "jpeg" = "png",
): Promise<void> => {
    saveBlob(await renderElementToBlob(elementId, format), `${fileName}.${format}`);
};

/**
 * Triggers the browser download of a URL (data URL or object URL).
 */
export const saveUrl = (url: string, fileName: string): void => {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
};

/**
 * Triggers the browser download of a Blob.
 */
export const saveBlob = (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob);
    saveUrl(url, fileName);
    // Revoking right away can cancel the download in some browsers
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Turns a title into a safe file name ("Paris Colouring" -> "paris-colouring").
 */
export const toFileSlug = (text: string, fallback = "produto"): string => {
    const slug = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
};

/**
 * Zero-padded position for file names, so they sort correctly (1 -> "01").
 */
export const padPosition = (position: number): string => String(position).padStart(2, "0");

export default downloadHtmlAsImage;

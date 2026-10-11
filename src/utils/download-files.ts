import { toPng, toJpeg } from "html-to-image";

/**
 * Faz o download de um elemento HTML renderizado como imagem PNG ou JPEG.
 *
 * @param elementId - ID do elemento HTML (ex: "preview-content")
 * @param fileName - Nome do arquivo de saída
 * @param format - Formato da imagem ("png" | "jpeg")
 * @throws Se o elemento não existir ou a imagem não puder ser gerada
 */
const downloadHtmlAsImage = async (
    elementId: string,
    fileName: string = "mockup",
    format: "png" | "jpeg" = "png",
): Promise<void> => {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
    }

    let dataUrl: string;

    if (format === "jpeg") {
        dataUrl = await toJpeg(element, {
            quality: 0.95,
            backgroundColor: "#ffffff", // fundo branco
        });
    } else {
        dataUrl = await toPng(element, {
            backgroundColor: "#ffffff",
        });
    }

    const link = document.createElement("a");
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    link.click();
};

export default downloadHtmlAsImage;

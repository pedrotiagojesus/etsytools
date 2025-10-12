import { toPng, toJpeg } from "html-to-image";

/**
 * Faz o download de um elemento HTML renderizado como imagem PNG ou JPEG.
 *
 * @param elementId - ID do elemento HTML (ex: "preview-content")
 * @param fileName - Nome do arquivo de saída
 * @param format - Formato da imagem ("png" | "jpeg")
 */
const downloadHtmlAsImage = async (
    elementId: string,
    fileName: string = "mockup",
    format: "png" | "jpeg" = "png"
): Promise<void> => {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(`Elemento com ID "${elementId}" não encontrado.`);
        return;
    }

    try {
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
    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
    }
};

export default downloadHtmlAsImage;

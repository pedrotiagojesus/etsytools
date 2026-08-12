import { toPng } from "html-to-image";

/**
 * Renderiza um elemento HTML para PNG e recorta ao quadrado central,
 * replicando o corte que o Etsy aplica na miniatura da listagem.
 */
export const renderElementAsSquareThumbnail = async (
    elementId: string,
): Promise<string> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
    }

    const fullDataUrl = await toPng(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 1,
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Erro ao carregar imagem gerada."));
        img.src = fullDataUrl;
    });

    const side = Math.min(img.width, img.height);
    const offsetX = (img.width - side) / 2;
    const offsetY = (img.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Não foi possível criar contexto de canvas.");
    }

    ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, side, side);

    return canvas.toDataURL("image/png");
};
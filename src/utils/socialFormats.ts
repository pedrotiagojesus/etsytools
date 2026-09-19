export const SOCIAL_FORMATS = [
    { key: "pinterest", label: "Pinterest", width: 1000, height: 1500 },
    { key: "instagram", label: "Instagram", width: 1080, height: 1080 },
] as const;

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Não foi possível carregar a imagem para recorte"));
        img.src = dataUrl;
    });

/**
 * Recorta (cover-fit, como qualquer rede social faria) uma imagem já
 * capturada para as dimensões-alvo — perde algum conteúdo lateral/topo se a
 * proporção de origem for muito diferente da de destino, tal como o i9 já
 * tornou visível para a grelha do Etsy.
 */
export async function cropDataUrlToFormat(
    dataUrl: string,
    targetWidth: number,
    targetHeight: number,
): Promise<string> {
    const img = await loadImage(dataUrl);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível obter o contexto 2D do canvas");

    const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    return canvas.toDataURL("image/jpeg", 0.92);
}

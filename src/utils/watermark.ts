/**
 * Roda o contexto e repete o texto em grelha, cobrindo toda a área mesmo
 * depois da rotação (por isso o loop vai bem além dos limites width/height).
 */
const drawDiagonalWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
): void => {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000000";
    ctx.font = `${Math.round(width / 12)}px sans-serif`;
    ctx.textBaseline = "middle";

    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);

    const textWidth = ctx.measureText(text).width;
    const stepX = textWidth + width * 0.15;
    const stepY = height / 6;

    const span = width + height;
    for (let y = -span; y < span; y += stepY) {
        for (let x = -span; x < span; x += stepX) {
            ctx.fillText(text, x, y);
        }
    }

    ctx.restore();
};

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Não foi possível carregar a imagem para a marca de água"));
        img.src = dataUrl;
    });

/** Desenha uma marca de água diagonal repetida sobre uma imagem (dataURL → dataURL JPEG). */
export const applyWatermarkToDataUrl = async (dataUrl: string, text: string): Promise<string> => {
    const img = await loadImage(dataUrl);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível obter o contexto 2D do canvas");

    ctx.drawImage(img, 0, 0);
    drawDiagonalWatermark(ctx, canvas.width, canvas.height, text);

    return canvas.toDataURL("image/jpeg", 0.95);
};

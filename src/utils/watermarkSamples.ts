import JSZip from "jszip";

export interface WatermarkResult {
    ok: string[];
    failed: { name: string; error: string }[];
}

const slugify = (name: string): string =>
    name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\.[a-z0-9]+$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "amostra";

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

export async function generateWatermarkedSamplesZip(
    files: File[],
    watermarkText: string,
): Promise<WatermarkResult> {
    const zip = new JSZip();
    const ok: string[] = [];
    const failed: WatermarkResult["failed"] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            const bitmap = await createImageBitmap(file);

            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Não foi possível obter o contexto 2D do canvas");

            ctx.drawImage(bitmap, 0, 0);
            bitmap.close();

            drawDiagonalWatermark(ctx, canvas.width, canvas.height, watermarkText);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            const base64 = dataUrl.split(",")[1] ?? "";
            const filename = `sample-${i + 1}-${slugify(file.name)}.jpg`;

            zip.file(filename, base64, { base64: true });
            ok.push(file.name);
        } catch (err) {
            failed.push({ name: file.name, error: err instanceof Error ? err.message : String(err) });
        }
    }

    if (ok.length > 0) {
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "amostras-marca-dagua.zip";
        a.click();
        URL.revokeObjectURL(url);
    }

    return { ok, failed };
}

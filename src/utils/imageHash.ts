export const HASH_WIDTH = 9;
export const HASH_HEIGHT = 8;

// Hamming distance máxima (em 64 bits) para considerar duas páginas
// "quase-duplicadas". <=6 bits diferentes ~= 90%+ de semelhança estrutural
// — é uma heurística, não uma comparação exata.
export const DUPLICATE_THRESHOLD = 6;

export function computeDifferenceHash(grayscale: number[]): string {
    if (grayscale.length !== HASH_WIDTH * HASH_HEIGHT) {
        throw new Error(
            `computeDifferenceHash espera ${HASH_WIDTH * HASH_HEIGHT} valores, recebeu ${grayscale.length}`,
        );
    }

    let hash = "";
    for (let row = 0; row < HASH_HEIGHT; row++) {
        for (let col = 0; col < HASH_WIDTH - 1; col++) {
            const left = grayscale[row * HASH_WIDTH + col];
            const right = grayscale[row * HASH_WIDTH + col + 1];
            hash += left < right ? "1" : "0";
        }
    }

    return hash;
}

export function hammingDistance(hashA: string, hashB: string): number {
    if (hashA.length !== hashB.length) {
        throw new Error("hammingDistance espera hashes do mesmo tamanho");
    }

    let distance = 0;
    for (let i = 0; i < hashA.length; i++) {
        if (hashA[i] !== hashB[i]) distance++;
    }

    return distance;
}

export async function computeImageHash(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement("canvas");
    canvas.width = HASH_WIDTH;
    canvas.height = HASH_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Não foi possível obter o contexto 2D do canvas");

    ctx.drawImage(bitmap, 0, 0, HASH_WIDTH, HASH_HEIGHT);
    bitmap.close();

    const { data } = ctx.getImageData(0, 0, HASH_WIDTH, HASH_HEIGHT);
    const grayscale: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        grayscale.push(0.299 * r + 0.587 * g + 0.114 * b);
    }

    return computeDifferenceHash(grayscale);
}

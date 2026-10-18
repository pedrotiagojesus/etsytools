import { describe, expect, it } from "vitest";
import { computeCoverTransform } from "./cover-fit";

describe("computeCoverTransform", () => {
    it("recorte quadrado de uma imagem 4:3 limita-se pela altura e corta os lados", () => {
        // 3000×2250 numa caixa 200×200: escala pela altura, sobra largura.
        const { scale, x, y } = computeCoverTransform(200, 200, 3000, 2250);

        expect(scale).toBeCloseTo(200 / 2250, 6);
        expect(y).toBeCloseTo(0, 6);
        // Centrado: metade do excesso de largura de cada lado (x negativo).
        expect(x).toBeCloseTo((200 - 3000 * scale) / 2, 6);
        expect(x).toBeLessThan(0);
    });

    it("caixa com a mesma proporção do conteúdo não corta nada", () => {
        const { scale, x, y } = computeCoverTransform(400, 300, 3000, 2250);

        expect(scale).toBeCloseTo(400 / 3000, 6);
        expect(x).toBeCloseTo(0, 6);
        expect(y).toBeCloseTo(0, 6);
    });

    it("o conteúdo escalado cobre sempre a caixa toda", () => {
        for (const [bw, bh] of [
            [200, 200],
            [300, 225],
            [150, 300],
        ]) {
            const { scale, x, y } = computeCoverTransform(bw, bh, 3000, 2250);
            expect(3000 * scale + 2 * x).toBeCloseTo(bw, 6);
            expect(2250 * scale + 2 * y).toBeCloseTo(bh, 6);
            expect(3000 * scale).toBeGreaterThanOrEqual(bw - 1e-9);
            expect(2250 * scale).toBeGreaterThanOrEqual(bh - 1e-9);
        }
    });
});

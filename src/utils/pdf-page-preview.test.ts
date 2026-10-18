import { describe, expect, it } from "vitest";
import { computePagePreviewLayout, PDF_PAGES } from "./pdf-page-preview";

const A4 = PDF_PAGES.a4;
const LETTER = PDF_PAGES.letter;

describe("computePagePreviewLayout", () => {
    it("imagens pequenas enchem a área útil, como os SVG no PDF (sem limite de ampliação)", () => {
        const layout = computePagePreviewLayout(10, 10);
        expect(layout.widthPercent).toBeCloseTo(100, 5);
        expect(layout.heightPercent).toBeLessThanOrEqual(100);
    });

    it("imagem com a proporção exata da área útil ocupa quase 100% em ambos os eixos", () => {
        const innerWidthPt = A4.widthPt - 2 * A4.marginPt - A4.borderWidthPt;
        const innerHeightPt = A4.heightPt - 2 * A4.marginPt - A4.borderWidthPt;

        const layout = computePagePreviewLayout(innerWidthPt, innerHeightPt);

        expect(layout.widthPercent).toBeCloseTo(100, 5);
        expect(layout.heightPercent).toBeCloseTo(100, 5);
        expect(layout.fillRatio).toBeCloseTo(1, 5);
        expect(layout.isSparse).toBe(false);
    });

    it("imagem muito larga e baixa produz fillRatio baixo e isSparse true", () => {
        const layout = computePagePreviewLayout(4000, 200);
        expect(layout.fillRatio).toBeLessThan(0.5);
        expect(layout.isSparse).toBe(true);
    });

    it("imagem muito estreita e alta produz fillRatio baixo e isSparse true", () => {
        const layout = computePagePreviewLayout(200, 4000);
        expect(layout.fillRatio).toBeLessThan(0.5);
        expect(layout.isSparse).toBe(true);
    });

    it("usa as constantes reais do backend (studio-base-api/src/config/pdf.ts)", () => {
        expect(A4.widthPt).toBe(595.28);
        expect(A4.heightPt).toBe(841.89);
        expect(LETTER.widthPt).toBe(612);
        expect(LETTER.heightPt).toBe(792);

        for (const page of [A4, LETTER]) {
            expect(page.marginPt).toBe(12);
            expect(page.borderWidthPt).toBe(2);
        }
    });

    it("em Letter, uma imagem com a proporção da área útil A4 deixa espaço nas laterais", () => {
        // A área útil do Letter é mais larga/baixa do que a do A4: a mesma
        // imagem A4 fica limitada pela altura e não preenche a largura toda.
        const innerWidthA4 = A4.widthPt - 2 * A4.marginPt - A4.borderWidthPt;
        const innerHeightA4 = A4.heightPt - 2 * A4.marginPt - A4.borderWidthPt;

        const layout = computePagePreviewLayout(innerWidthA4, innerHeightA4, "letter");

        expect(layout.heightPercent).toBeCloseTo(100, 5);
        expect(layout.widthPercent).toBeLessThan(100);
    });
});

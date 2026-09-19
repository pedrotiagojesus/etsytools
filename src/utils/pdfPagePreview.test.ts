import { describe, expect, it } from "vitest";
import { computePagePreviewLayout, PDF_PAGE } from "./pdfPagePreview";

describe("computePagePreviewLayout", () => {
    it("nunca excede 100% mesmo com imagens minúsculas (upscale capado)", () => {
        const layout = computePagePreviewLayout(10, 10);
        expect(layout.widthPercent).toBeLessThanOrEqual(100);
        expect(layout.heightPercent).toBeLessThanOrEqual(100);
    });

    it("respeita o cap de upscale de 3x do backend", () => {
        // Área útil é muito maior que a imagem; sem cap, o scale ultrapassaria 3x.
        const innerWidthPt =
            PDF_PAGE.widthPt - 2 * PDF_PAGE.marginPt - PDF_PAGE.borderWidthPt;
        const tinyWidth = innerWidthPt / 10; // scale "natural" seria 10x
        const layout = computePagePreviewLayout(tinyWidth, tinyWidth);
        const expectedPercent = (PDF_PAGE.maxImageUpscale * tinyWidth) / innerWidthPt * 100;
        expect(layout.widthPercent).toBeCloseTo(expectedPercent, 5);
    });

    it("imagem com a proporção exata da área útil ocupa quase 100% em ambos os eixos", () => {
        const innerWidthPt =
            PDF_PAGE.widthPt - 2 * PDF_PAGE.marginPt - PDF_PAGE.borderWidthPt;
        const innerHeightPt =
            PDF_PAGE.heightPt - 2 * PDF_PAGE.marginPt - PDF_PAGE.borderWidthPt;

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
        expect(PDF_PAGE.widthPt).toBe(595.28);
        expect(PDF_PAGE.heightPt).toBe(841.89);
        expect(PDF_PAGE.marginPt).toBe(12);
        expect(PDF_PAGE.borderWidthPt).toBe(2);
        expect(PDF_PAGE.maxImageUpscale).toBe(3);
    });
});

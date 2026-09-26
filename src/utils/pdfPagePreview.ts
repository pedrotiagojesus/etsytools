import type { PaperSize } from "./paperSizes";

export interface PdfPageSpec {
    widthPt: number;
    heightPt: number;
    marginPt: number;
    borderWidthPt: number;
    maxImageUpscale: number;
}

// Espelha studio-base-api/src/config/pdf.ts (pdfSizes) — mesmas páginas,
// margens e borda que o backend usa em createPdf.ts, para a pré-visualização
// bater certo com o PDF real gerado.
const commonPageSettings = {
    marginPt: 12,
    borderWidthPt: 2,
    maxImageUpscale: 3,
};

export const PDF_PAGES: Record<PaperSize, PdfPageSpec> = {
    a4: { widthPt: 595.28, heightPt: 841.89, ...commonPageSettings },
    letter: { widthPt: 612, heightPt: 792, ...commonPageSettings },
};

// Abaixo disto, a imagem ocupa pouco da página e sobra muito espaço em
// branco à volta — vale a pena avisar antes de gerar o PDF.
export const SPARSE_FILL_THRESHOLD = 0.5;

export interface PagePreviewLayout {
    widthPercent: number;
    heightPercent: number;
    fillRatio: number;
    isSparse: boolean;
}

export function computePagePreviewLayout(
    imgWidth: number,
    imgHeight: number,
    paperSize: PaperSize = "a4",
): PagePreviewLayout {
    const page = PDF_PAGES[paperSize];

    const innerWidthPt = page.widthPt - 2 * page.marginPt - page.borderWidthPt;
    const innerHeightPt = page.heightPt - 2 * page.marginPt - page.borderWidthPt;

    const scale = Math.min(
        innerWidthPt / imgWidth,
        innerHeightPt / imgHeight,
        page.maxImageUpscale,
    );

    const scaledWidthPt = imgWidth * scale;
    const scaledHeightPt = imgHeight * scale;

    const widthPercent = (scaledWidthPt / innerWidthPt) * 100;
    const heightPercent = (scaledHeightPt / innerHeightPt) * 100;
    const fillRatio =
        (scaledWidthPt * scaledHeightPt) / (innerWidthPt * innerHeightPt);

    return {
        widthPercent,
        heightPercent,
        fillRatio,
        isSparse: fillRatio < SPARSE_FILL_THRESHOLD,
    };
}

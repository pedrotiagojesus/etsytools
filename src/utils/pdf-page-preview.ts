import type { PaperSize } from "./paper-sizes";

export interface PdfPageSpec {
    widthPt: number;
    heightPt: number;
    marginPt: number;
    borderWidthPt: number;
}

// Espelha studio-base-api/src/modules/imgtools/config/pdf.ts (PAPER_SIZES e
// pdf.margin/border_width) — mesmas páginas, margens e borda que o backend
// usa em createPdf, para a pré-visualização bater certo com o PDF real.
// O backend desenha as páginas como SVG (vetorizadas), que enchem sempre a
// área útil: não há limite de ampliação.
const commonPageSettings = {
    marginPt: 12,
    borderWidthPt: 2,
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

    const scale = Math.min(innerWidthPt / imgWidth, innerHeightPt / imgHeight);

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

// Espelha studio-base-api/src/config/pdf.ts — mesma página A4, margens e
// borda que o backend usa em createPdf.ts, para a pré-visualização bater
// certo com o PDF real gerado.
export const PDF_PAGE = {
    widthPt: 595.28,
    heightPt: 841.89,
    marginPt: 12,
    borderWidthPt: 2,
    maxImageUpscale: 3,
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
): PagePreviewLayout {
    const innerWidthPt =
        PDF_PAGE.widthPt - 2 * PDF_PAGE.marginPt - PDF_PAGE.borderWidthPt;
    const innerHeightPt =
        PDF_PAGE.heightPt - 2 * PDF_PAGE.marginPt - PDF_PAGE.borderWidthPt;

    const scale = Math.min(
        innerWidthPt / imgWidth,
        innerHeightPt / imgHeight,
        PDF_PAGE.maxImageUpscale,
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

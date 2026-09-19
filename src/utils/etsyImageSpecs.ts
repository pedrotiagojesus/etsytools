/**
 * Especificações reais e atuais de imagens de ficha do Etsy (confirmadas por
 * pesquisa web em Setembro 2026 — letsenhance.io, soona.co, snaptosize.com,
 * consistentes entre si): mínimo de 2000px no lado mais curto para zoom
 * completo, mínimo absoluto de 635px (abaixo disto o Etsy despromove a
 * listagem na pesquisa), e proporção recomendada 1:1 ou 4:3.
 */

export const ETSY_MIN_ZOOM_DIMENSION = 2000;
export const ETSY_MIN_THUMBNAIL_DIMENSION = 635;
export const ETSY_ASPECT_RATIOS = { square: 1, landscape: 4 / 3 };
export const ASPECT_RATIO_TOLERANCE = 0.05;

export interface ImageSpecCheck {
    width: number;
    height: number;
    shortestSide: number;
    meetsZoomMinimum: boolean;
    belowAbsoluteMinimum: boolean;
    aspectRatioOk: boolean;
}

export function checkImageSpecs(width: number, height: number): ImageSpecCheck {
    const shortestSide = Math.min(width, height);
    const ratio = width / height;

    const aspectRatioOk = Object.values(ETSY_ASPECT_RATIOS).some(
        (target) => Math.abs(ratio - target) / target <= ASPECT_RATIO_TOLERANCE,
    );

    return {
        width,
        height,
        shortestSide,
        meetsZoomMinimum: shortestSide >= ETSY_MIN_ZOOM_DIMENSION,
        belowAbsoluteMinimum: shortestSide < ETSY_MIN_THUMBNAIL_DIMENSION,
        aspectRatioOk,
    };
}

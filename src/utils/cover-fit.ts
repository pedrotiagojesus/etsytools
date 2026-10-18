/**
 * Transformação CSS (origem top-left) que faz um conteúdo de tamanho
 * natural (contentWidth × contentHeight) preencher por completo uma caixa
 * (boxWidth × boxHeight), centrado e com o excesso cortado — o mesmo que
 * `object-fit: cover`, que é como o Etsy recorta as miniaturas.
 */
export const computeCoverTransform = (
    boxWidth: number,
    boxHeight: number,
    contentWidth: number,
    contentHeight: number,
): { scale: number; x: number; y: number } => {
    const scale = Math.max(boxWidth / contentWidth, boxHeight / contentHeight);

    return {
        scale,
        x: (boxWidth - contentWidth * scale) / 2,
        y: (boxHeight - contentHeight * scale) / 2,
    };
};

// Função utilitária — centraliza o conteúdo dentro do preview
export const centerContent = (
    setTransform: (x: number, y: number, scale: number) => void,
    previewId?: string | "preview-section"
) => {
    setTimeout(() => {
        const container = document.querySelector(`#${previewId}`) as HTMLDivElement;
        const content = container?.querySelector(".preview-content") as HTMLDivElement;
        if (!container || !content) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const margin = 40;

        const contentWidth = content.scrollWidth + margin * 2;
        const contentHeight = content.scrollHeight + margin * 2;

        const scaleX = containerWidth / (contentWidth + margin * 2);
        const scaleY = containerHeight / (contentHeight + margin * 2);

        const scale = Math.min(scaleX, scaleY, 1);

        const offsetX = (containerWidth - contentWidth * scale) / 2;
        const offsetY = (containerHeight - contentHeight * scale) / 2;

        setTransform(offsetX, offsetY, scale);
    }, 200);
};

export const centerContent = (
    setTransform: (x: number, y: number, scale: number) => void,
    previewId = "preview-section"
) => {
    const container = document.querySelector(`#${previewId}`) as HTMLDivElement | null;
    const content = container?.querySelector(".preview-content") as HTMLDivElement | null;
    if (!container || !content) return { x: 0, y: 0, scale: 1 };

    const margin = 40;
    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const availableWidth = containerRect.width - margin * 2;
    const availableHeight = containerRect.height - margin * 2;
    const scaleX = availableWidth / contentRect.width;
    const scaleY = availableHeight / contentRect.height;
    const scale = Math.min(scaleX, scaleY, 1);

    const x = (containerRect.width - contentRect.width * scale) / 2;
    const y = (containerRect.height - contentRect.height * scale) / 2;

    setTransform(x, y, scale);
    return { x, y, scale };
};

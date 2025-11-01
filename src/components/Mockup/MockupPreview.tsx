import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import { centerContent } from "../../utils/centerMockuptPreview";
import MockupToolbar from "./MockupToolbar";

interface MockupPreviewProps {
    previewId?: string;
    previewDisplayId?: string;
    previewHtml: string;
    previewCss: string;
}

const MockupPreview: React.FC<MockupPreviewProps> = ({
    previewId = "preview-content",
    previewDisplayId = "preview-display",
    previewHtml,
    previewCss,
}) => {
    useEffect(() => {
        const styleTag = document.getElementById("mockup-style") || document.createElement("style");
        styleTag.id = "mockup-style";
        styleTag.innerHTML = `${previewCss} ?? ""}`;
        document.head.appendChild(styleTag);
    }, [previewCss]);

    const [guideLine, setGuideLine] = useState(false);
    const initialScaleRef = useRef<number>(1);
    const MARGIN = 40;

    return (
        <div id={previewId} className="preview-section">
            <TransformWrapper
                centerOnInit
                limitToBounds={false}
                onInit={({ setTransform }) => {
                    const { scale } = centerContent(setTransform, previewId);
                    initialScaleRef.current = scale;
                }}
                minScale={initialScaleRef.current}
                maxScale={3}
                onPanningStop={({ state, setTransform }) => {
                    // ✅ impede arrastar para além da margem
                    const container = document.querySelector(`#${previewId}`) as HTMLDivElement;
                    const content = container?.querySelector(".preview-content") as HTMLDivElement;
                    if (!container || !content) return;

                    const containerRect = container.getBoundingClientRect();
                    const contentRect = {
                        width: content.scrollWidth * state.scale,
                        height: content.scrollHeight * state.scale,
                    };

                    // limites de deslocamento
                    const minX = containerRect.width - contentRect.width - MARGIN;
                    const maxX = MARGIN;
                    const minY = containerRect.height - contentRect.height - MARGIN;
                    const maxY = MARGIN;

                    const newX = Math.min(Math.max(state.positionX, minX), maxX);
                    const newY = Math.min(Math.max(state.positionY, minY), maxY);

                    if (newX !== state.positionX || newY !== state.positionY) {
                        setTransform(newX, newY, state.scale);
                    }
                }}
            >
                {({ zoomIn, zoomOut, setTransform }) => (
                    <>
                        <MockupToolbar
                            guideLine={guideLine}
                            setGuideLine={setGuideLine}
                            zoomIn={() => {
                                // impede zoom out abaixo do inicial
                                zoomIn();
                            }}
                            zoomOut={() => {
                                if (initialScaleRef.current && state.scale <= initialScaleRef.current) return;
                                zoomOut();
                            }}
                            center={() => {
                                const { x, y, scale } = centerContent(setTransform, previewId);
                                initialScaleRef.current = scale;
                            }}
                        />
                        <TransformComponent>
                            <div
                                id={previewDisplayId}
                                className="preview-content"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            ></div>
                            {guideLine && <div className="guide-lines" id="guide-lines"></div>}
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default MockupPreview;

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import { centerContent } from "@utils/center-mockup-preview";
import { loadFontsFromCss } from "@utils/load-fonts";
import { useToast } from "@hooks/use-toast";
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
    const { showError } = useToast();
    // O CSS muda a cada edição; evita repetir o aviso para a mesma fonte
    const reportedFonts = useRef(new Set<string>());

    useEffect(() => {
        const styleTag = document.getElementById("mockup-style") || document.createElement("style");
        styleTag.id = "mockup-style";
        styleTag.innerHTML = `${previewCss ?? ""}`;
        document.head.appendChild(styleTag);

        const loadPreviewFonts = async () => {
            const failedFonts = await loadFontsFromCss(previewCss);
            const newFailures = failedFonts.filter((font) => !reportedFonts.current.has(font));
            if (newFailures.length === 0) return;

            newFailures.forEach((font) => reportedFonts.current.add(font));
            showError(`Não foi possível carregar as fontes: ${newFailures.join(", ")}`);
        };

        loadPreviewFonts();
    }, [previewCss, showError]);

    const [isGuideLineVisible, setIsGuideLineVisible] = useState(false);
    const initialScaleRef = useRef<number>(1);
    const currentScaleRef = useRef<number>(1);
    const MARGIN = 40;

    return (
        <div id={previewId} className="preview-section">
            <TransformWrapper
                centerOnInit
                limitToBounds={false}
                onInit={({ setTransform }) => {
                    const { scale } = centerContent(setTransform, previewId);
                    initialScaleRef.current = scale;
                    currentScaleRef.current = scale;
                }}
                minScale={initialScaleRef.current}
                maxScale={3}
                onTransformed={(_ref, state) => {
                    currentScaleRef.current = state.scale;
                }}
                onPanningStop={({ state, setTransform }) => {
                    const container = document.querySelector<HTMLDivElement>(`#${previewId}`);
                    const content = container?.querySelector<HTMLDivElement>(".preview-content");
                    if (!container || !content) return;

                    const containerRect = container.getBoundingClientRect();
                    const contentRect = {
                        width: content.scrollWidth * state.scale,
                        height: content.scrollHeight * state.scale,
                    };

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
                            isGuideLineVisible={isGuideLineVisible}
                            setIsGuideLineVisible={setIsGuideLineVisible}
                            zoomIn={() => {
                                zoomIn();
                            }}
                            zoomOut={() => {
                                if (initialScaleRef.current && currentScaleRef.current <= initialScaleRef.current)
                                    return;
                                zoomOut();
                            }}
                            center={() => {
                                const { scale } = centerContent(setTransform, previewId);
                                initialScaleRef.current = scale;
                                currentScaleRef.current = scale;
                            }}
                        />
                        <TransformComponent>
                            <div
                                id={previewDisplayId}
                                className="preview-content"
                                dangerouslySetInnerHTML={{
                                    __html: previewHtml,
                                }}
                            ></div>
                            {isGuideLineVisible && <div className="guide-lines" id="guide-lines"></div>}
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default MockupPreview;

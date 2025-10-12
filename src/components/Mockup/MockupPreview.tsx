import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useState } from "react";
import { centerContent } from "../../utils/centerMockuptPreview";
import MockupToolbar from "./MockupToolbar";

interface MockupPreviewProps {
    previewHtml: string;
    previewCss: string;
}

const MockupPreview: React.FC<MockupPreviewProps> = ({
    previewHtml,
    previewCss,
}) => {
    // Atualiza CSS dinamicamente
    useEffect(() => {
        const styleTag = document.getElementById("mockup-style") || document.createElement("style");
        styleTag.id = "mockup-style";
        styleTag.innerHTML = `${previewCss} ?? ""}`;
        document.head.appendChild(styleTag);
    }, [previewCss]);


    const [guideLine, setGuideLine] = useState(false);

    return (
        <div id="preview-section">
            <TransformWrapper
                minScale={0.1}
                centerOnInit
                limitToBounds={false}
                onInit={({ setTransform }) => centerContent(setTransform)}
            >
                {({ zoomIn, zoomOut, setTransform }) => (
                    <>
                        <MockupToolbar
                            guideLine={guideLine}
                            setGuideLine={setGuideLine}
                            zoomIn={zoomIn}
                            zoomOut={zoomOut}
                            center={() => centerContent(setTransform)}
                        />
                        <TransformComponent>
                            <div
                                id="preview-content"
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

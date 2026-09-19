import { useEffect, useRef, useState } from "react";
import { loadFontsFromCss } from "@utils/loadFonts";

// CSS
import "./EtsyThumbnailPreview.css";

interface EtsyThumbnailPreviewProps {
    previewHtml: string;
    previewCss: string;
}

// Aproximação ao tamanho real de uma miniatura na grelha de pesquisa
// desktop do Etsy — varia por ecrã/breakpoint, não existe um valor único
// "oficial" em pixels, mas ~280px é representativo do desktop.
const THUMBNAIL_SIZE = 280;

const PLACEHOLDER_CARDS = 3;

const EtsyThumbnailPreview: React.FC<EtsyThumbnailPreviewProps> = ({ previewHtml, previewCss }) => {
    const styleTagId = "mockup-style-etsy-thumbnail";
    const contentRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("");

    useEffect(() => {
        const styleTag = document.getElementById(styleTagId) || document.createElement("style");
        styleTag.id = styleTagId;
        styleTag.textContent = previewCss ?? "";
        document.head.appendChild(styleTag);

        loadFontsFromCss(previewCss);
    }, [previewCss, styleTagId]);

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const content = contentRef.current;
            if (!content) return;

            const rect = content.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const scale = THUMBNAIL_SIZE / Math.min(rect.width, rect.height);
            const x = (THUMBNAIL_SIZE - rect.width * scale) / 2;
            const y = (THUMBNAIL_SIZE - rect.height * scale) / 2;

            setTransform(`translate(${x}px, ${y}px) scale(${scale})`);
        });

        return () => cancelAnimationFrame(raf);
    }, [previewHtml, previewCss]);

    return (
        <div>
            <p className="etsy-thumbnail-note">
                Aproximação de como esta imagem fica na grelha de pesquisa do Etsy — a foto é recortada a quadrado
                (1:1), por isso os lados podem ficar cortados se o mockup não for já quadrado.
            </p>
            <div className="etsy-thumbnail-grid">
                <div className="etsy-thumbnail-card real">
                    <div className="etsy-thumbnail-crop">
                        <div
                            ref={contentRef}
                            className="preview-content"
                            style={{ transform }}
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                        ></div>
                    </div>
                    <span className="etsy-thumbnail-label">O teu produto</span>
                </div>

                {Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
                    <div className="etsy-thumbnail-card" key={i}>
                        <div className="etsy-thumbnail-crop"></div>
                        <div className="etsy-thumbnail-placeholder-bar"></div>
                        <div className="etsy-thumbnail-placeholder-bar short"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EtsyThumbnailPreview;

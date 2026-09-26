import { useEffect, useRef, useState } from "react";
import { loadFontsFromCss } from "@utils/loadFonts";
import { computeCoverTransform } from "@utils/coverFit";

// CSS
import "./EtsyThumbnailPreview.css";

interface EtsyThumbnailPreviewProps {
    previewHtml: string;
    previewCss: string;
}

interface ThumbnailFormat {
    key: string;
    label: string;
    ratio: string;
    aspectRatio: string;
}

// O Etsy recorta a imagem principal ao centro (como `object-fit: cover`), com
// proporção 4:3 na grelha desktop e 1:1 no telemóvel. Os tamanhos em pixels
// variam com o ecrã, por isso a caixa é fluida e o conteúdo é escalado para
// o tamanho real que ela tem.
const FORMATS: ThumbnailFormat[] = [
    { key: "desktop", label: "Desktop", ratio: "4:3", aspectRatio: "4 / 3" },
    { key: "mobile", label: "Telemóvel", ratio: "1:1", aspectRatio: "1 / 1" },
];

const PLACEHOLDER_CARDS = 3;

interface ThumbnailCropProps {
    previewHtml: string;
    previewCss: string;
    aspectRatio: string;
}

const ThumbnailCrop: React.FC<ThumbnailCropProps> = ({ previewHtml, previewCss, aspectRatio }) => {
    const cropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("");

    useEffect(() => {
        const crop = cropRef.current;
        if (!crop) return;

        const update = () => {
            const content = contentRef.current;
            if (!content) return;

            // offsetWidth/Height ignoram transforms — dão o tamanho natural do
            // mockup mesmo depois de uma escala anterior já ter sido aplicada.
            const naturalWidth = content.offsetWidth;
            const naturalHeight = content.offsetHeight;
            if (naturalWidth === 0 || naturalHeight === 0 || crop.clientWidth === 0) return;

            const { scale, x, y } = computeCoverTransform(
                crop.clientWidth,
                crop.clientHeight,
                naturalWidth,
                naturalHeight,
            );
            setTransform(`translate(${x}px, ${y}px) scale(${scale})`);
        };

        const raf = requestAnimationFrame(update);
        const observer = new ResizeObserver(update);
        observer.observe(crop);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, [previewHtml, previewCss]);

    return (
        <div ref={cropRef} className="etsy-thumbnail-crop" style={{ aspectRatio }}>
            <div
                ref={contentRef}
                className="preview-content"
                style={{ transform }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
            ></div>
        </div>
    );
};

const EtsyThumbnailPreview: React.FC<EtsyThumbnailPreviewProps> = ({ previewHtml, previewCss }) => {
    const styleTagId = "mockup-style-etsy-thumbnail";

    useEffect(() => {
        const styleTag = document.getElementById(styleTagId) || document.createElement("style");
        styleTag.id = styleTagId;
        styleTag.textContent = previewCss ?? "";
        document.head.appendChild(styleTag);

        loadFontsFromCss(previewCss);
    }, [previewCss, styleTagId]);

    // Os templates partilham nomes de classe (.text1, .safe-zone, ...): se
    // esta tag ficasse no documento depois de fechar o modal, o CSS deste
    // slide continuaria a contaminar o preview principal e as exportações.
    useEffect(() => {
        return () => document.getElementById(styleTagId)?.remove();
    }, [styleTagId]);

    return (
        <div>
            <p className="etsy-thumbnail-note">
                Aproximação de como a imagem principal aparece na grelha de pesquisa do Etsy. A miniatura é
                recortada ao centro: 4:3 no desktop e 1:1 no telemóvel (o Etsy não publica um valor oficial e
                pode mudar). Num mockup 4:3, o recorte 1:1 perde 12,5% de cada lado — mantém o título e o
                essencial na zona central.
            </p>

            {FORMATS.map((format) => (
                <section className="etsy-thumbnail-section" key={format.key}>
                    <h2 className="etsy-thumbnail-heading">
                        {format.label} <span>({format.ratio})</span>
                    </h2>
                    <div className="etsy-thumbnail-grid">
                        <div className="etsy-thumbnail-card real">
                            <ThumbnailCrop
                                previewHtml={previewHtml}
                                previewCss={previewCss}
                                aspectRatio={format.aspectRatio}
                            />
                            <span className="etsy-thumbnail-label">O teu produto</span>
                        </div>

                        {Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
                            <div className="etsy-thumbnail-card" key={i}>
                                <div className="etsy-thumbnail-crop" style={{ aspectRatio: format.aspectRatio }}></div>
                                <div className="etsy-thumbnail-placeholder-bar"></div>
                                <div className="etsy-thumbnail-placeholder-bar short"></div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default EtsyThumbnailPreview;

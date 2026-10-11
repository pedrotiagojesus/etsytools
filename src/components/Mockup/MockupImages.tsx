import { useEffect, useState } from "react";
import { resizeImageToBase64, resizeImageUrl } from "@utils/resize-image";
import type { ProductPage } from "@utils/imgtools-api";
import { MOCKUP_IMAGE_MAX_SIZE, setSlotImage } from "@utils/mockup-slides";



interface MockupImagesProps {
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    images: { name: string; bg: string | null }[];
    setImages: (imgs: { name: string; bg: string | null }[]) => void;
    // Processed product pages (data URLs) the user can pick from
    pages: ProductPage[];
}

const MockupImages: React.FC<MockupImagesProps> = ({
    images,
    setImages,
    previewHtml,
    setPreviewHtml,
    pages,
}) => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll<HTMLDivElement>("div[data-img]"));

        const imgs = divs.map((div, i) => ({
            name: div.getAttribute("data-title") || `Imagem ${i + 1}`,
            bg: div.style.backgroundImage || null,
        }));
        setImages(imgs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewHtml]);

    const applyImage = async (index: number, loadImage: () => Promise<string>) => {
        setErrorIndex(null);
        setLoadingIndex(index);

        try {
            const base64 = await loadImage();
            setPreviewHtml(setSlotImage(previewHtml, index, base64));
        } catch (err) {
            console.error(
                `Erro ao processar imagem "${images[index]?.name}":`,
                err,
            );
            setErrorIndex(index);
        } finally {
            setLoadingIndex(null);
        }
    };

    return (
        <>
            {images.length ? (
                images.map((img, index) => (
                    <div key={index} className="row image-input">
                        <div className="col-3">
                            <div
                                className="image-preview"
                                style={{ backgroundImage: img.bg || "none" }}
                            >
                                {!img.bg && (
                                    <i
                                        className="bi bi-image"
                                        aria-hidden="true"
                                    ></i>
                                )}
                            </div>
                        </div>
                        <div className="col-9">
                            <h5>{img.name}</h5>
                            <input
                                type="file"
                                accept="image/*"
                                aria-label={`Selecionar imagem para ${img.name}`}
                                disabled={loadingIndex === index}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        await applyImage(index, () => resizeImageToBase64(file));
                                    }
                                    e.target.value = "";
                                }}
                            />
                            {pages.length > 0 && (
                                <div className="page-picker" role="group" aria-label={`Páginas do produto para ${img.name}`}>
                                    {pages.map((page, pageIndex) => (
                                        <button
                                            key={pageIndex}
                                            type="button"
                                            className="page-picker-item"
                                            disabled={loadingIndex === index}
                                            onClick={() =>
                                                applyImage(index, () => resizeImageUrl(page.image, MOCKUP_IMAGE_MAX_SIZE, MOCKUP_IMAGE_MAX_SIZE))
                                            }
                                            aria-label={`Usar a página ${pageIndex + 1} em ${img.name}`}
                                            title={`Página ${pageIndex + 1}`}
                                        >
                                            <img src={page.thumbnail} alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {loadingIndex === index && (
                                <div className="text-muted mt-1" role="status">
                                    <small>A processar imagem...</small>
                                </div>
                            )}
                            {errorIndex === index && (
                                <div className="text-danger mt-1" role="alert">
                                    <small>
                                        Erro ao processar a imagem. Tente
                                        novamente.
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>Nenhuma imagem encontrada.</p>
            )}
        </>
    );
};

export default MockupImages;

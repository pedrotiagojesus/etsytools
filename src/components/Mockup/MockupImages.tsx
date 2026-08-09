import { useEffect, useState } from "react";
import { resizeImageToBase64 } from "../../utils/resizeImage";

interface MockupImagesProps {
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    images: { name: string; bg: string | null }[];
    setImages: (imgs: { name: string; bg: string | null }[]) => void;
}

const MockupImages: React.FC<MockupImagesProps> = ({
    images,
    setImages,
    previewHtml,
    setPreviewHtml,
}) => {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(
            doc.querySelectorAll("div[data-img]"),
        ) as HTMLDivElement[];

        const imgs = divs.map((div, i) => ({
            name: div.getAttribute("data-title") || `Imagem ${i + 1}`,
            bg: div.style.backgroundImage || null,
        }));
        setImages(imgs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewHtml]);

    const handleFileSelect = async (index: number, file: File) => {
        setErrorIndex(null);
        setLoadingIndex(index);

        try {
            const base64 = await resizeImageToBase64(file);

            const parser = new DOMParser();
            const doc = parser.parseFromString(previewHtml, "text/html");
            const divs = Array.from(
                doc.querySelectorAll("div[data-img]"),
            ) as HTMLDivElement[];

            const div = divs[index];
            if (div) {
                div.style.backgroundImage = `url(${base64})`;
                setPreviewHtml(doc.documentElement.innerHTML);
            }
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
                                        await handleFileSelect(index, file);
                                    }
                                    e.target.value = "";
                                }}
                            />
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

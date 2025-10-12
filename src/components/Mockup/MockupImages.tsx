import { useEffect, useState } from "react";

interface MockupImagesProps {
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    images: { name: string; bg: string | null }[];
    setImages: (imgs: { name: string; bg: string | null }[]) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const MockupImages: React.FC<MockupImagesProps> = ({ images, setImages, previewHtml, setPreviewHtml }) => {
    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-img]")) as HTMLDivElement[];

        const imgs = divs.map((div, i) => ({
            name: div.getAttribute("data-title") || `Imagem ${i + 1}`,
            bg: div.style.backgroundImage || null,
        }));
        setImages(imgs);
    }, [previewHtml]);

    return (
        <>
            {images.length ? (
                images.map((img, index) => (
                    <div key={index} className="row image-input">
                        <div className="col-3">
                            <div className="image-preview" style={{ backgroundImage: img.bg || "none" }}>
                                {!img.bg && <i className="bi bi-image"></i>}
                            </div>
                        </div>
                        <div className="col-9">
                            <h5>{img.name}</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const base64 = await fileToBase64(file);

                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(previewHtml, "text/html");
                                        const divs = Array.from(
                                            doc.querySelectorAll("div[data-img]")
                                        ) as HTMLDivElement[];

                                        const div = divs[index];
                                        div.style.backgroundImage = `url(${base64})`;

                                        setPreviewHtml(doc.documentElement.innerHTML);
                                    }
                                }}
                            />
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

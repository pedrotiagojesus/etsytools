import { useEffect, useState } from "react";

export interface ImageDimensions {
    file: File;
    naturalWidth: number;
    naturalHeight: number;
    loading: boolean;
}

const readDimensions = (
    file: File,
): Promise<{ naturalWidth: number; naturalHeight: number }> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Não foi possível ler as dimensões de ${file.name}`));
        };

        img.src = url;
    });
};

export function useImageDimensions(images: File[]): ImageDimensions[] {
    const [dimensions, setDimensions] = useState<ImageDimensions[]>([]);

    useEffect(() => {
        let cancelled = false;

        setDimensions(
            images.map((file) => ({
                file,
                naturalWidth: 0,
                naturalHeight: 0,
                loading: true,
            })),
        );

        images.forEach((file, index) => {
            readDimensions(file)
                .then(({ naturalWidth, naturalHeight }) => {
                    if (cancelled) return;
                    setDimensions((prev) => {
                        const next = [...prev];
                        if (next[index]?.file === file) {
                            next[index] = { file, naturalWidth, naturalHeight, loading: false };
                        }
                        return next;
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        });

        return () => {
            cancelled = true;
        };
    }, [images]);

    return dimensions;
}

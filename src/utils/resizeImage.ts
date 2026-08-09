/**
 * Redimensiona uma imagem para caber num tamanho máximo, mantendo a proporção,
 * e devolve-a como data URI (base64) em PNG (preserva transparência).
 */
export const resizeImageToBase64 = (
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const img = new Image();

            img.onload = () => {
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(
                        maxWidth / width,
                        maxHeight / height,
                    );
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(
                        new Error("Não foi possível criar contexto de canvas."),
                    );
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/png", quality);
                resolve(dataUrl);
            };

            img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
            img.src = reader.result as string;
        };

        reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
        reader.readAsDataURL(file);
    });
};

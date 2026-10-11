const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
        reader.readAsDataURL(file);
    });

/**
 * Redimensiona uma imagem (data URL ou URL) para caber num tamanho máximo,
 * mantendo a proporção, e devolve-a como data URI em PNG (preserva transparência).
 */
export const resizeImageUrl = (url: string, maxWidth = 1200, maxHeight = 1200): Promise<string> =>
    new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Não foi possível criar contexto de canvas."));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
        img.src = url;
    });

/**
 * Igual a resizeImageUrl, mas a partir de um ficheiro escolhido pelo utilizador.
 */
export const resizeImageToBase64 = async (file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> =>
    resizeImageUrl(await readFileAsDataUrl(file), maxWidth, maxHeight);

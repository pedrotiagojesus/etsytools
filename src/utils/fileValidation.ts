export interface FileValidationResult {
    valid: boolean;
    message?: string;
}

const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_SIZE_MB = 60;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

/**
 * Valida um único ficheiro de imagem: tipo MIME e tamanho individual.
 */
export const validateImageFile = (file: File): FileValidationResult => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: `"${file.name}" tem um formato não suportado (${file.type || "desconhecido"}). Use PNG, JPEG ou WEBP.`,
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            message: `"${file.name}" tem ${sizeMb}MB, acima do limite de ${MAX_FILE_SIZE_MB}MB por ficheiro.`,
        };
    }

    return { valid: true };
};

/**
 * Valida uma lista de ficheiros: cada um individualmente e o total combinado.
 * Devolve o primeiro erro encontrado, ou valid: true se tudo passar.
 */
export const validateImageFiles = (files: File[]): FileValidationResult => {
    for (const file of files) {
        const result = validateImageFile(file);
        if (!result.valid) return result;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        const totalMb = (totalSize / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            message: `O total das imagens é ${totalMb}MB, acima do limite de ${MAX_TOTAL_SIZE_MB}MB.`,
        };
    }

    return { valid: true };
};

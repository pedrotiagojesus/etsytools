import { describe, expect, it } from "vitest";
import { validateImageFile, validateImageFiles } from "./fileValidation";

const MB = 1024 * 1024;

const makeFile = (name: string, type: string, sizeBytes: number): File => {
    const file = new File(["conteudo"], name, { type });
    Object.defineProperty(file, "size", { value: sizeBytes, configurable: true });
    return file;
};

describe("validateImageFile", () => {
    it("aceita PNG/JPEG/WEBP dentro do limite de tamanho", () => {
        const file = makeFile("foto.png", "image/png", 1 * MB);
        expect(validateImageFile(file).valid).toBe(true);
    });

    it("rejeita um formato não suportado", () => {
        const file = makeFile("documento.pdf", "application/pdf", 1 * MB);
        const result = validateImageFile(file);
        expect(result.valid).toBe(false);
        expect(result.message).toContain("formato não suportado");
    });

    it("rejeita um ficheiro acima do limite de 15MB", () => {
        const file = makeFile("grande.png", "image/png", 16 * MB);
        const result = validateImageFile(file);
        expect(result.valid).toBe(false);
        expect(result.message).toContain("15MB");
    });

    it("aceita exatamente no limite de 15MB", () => {
        const file = makeFile("limite.png", "image/png", 15 * MB);
        expect(validateImageFile(file).valid).toBe(true);
    });
});

describe("validateImageFiles", () => {
    it("aceita uma lista de ficheiros válidos dentro do total combinado", () => {
        const files = [
            makeFile("a.png", "image/png", 10 * MB),
            makeFile("b.jpeg", "image/jpeg", 10 * MB),
        ];
        expect(validateImageFiles(files).valid).toBe(true);
    });

    it("rejeita assim que encontra o primeiro ficheiro inválido", () => {
        const files = [
            makeFile("a.png", "image/png", 1 * MB),
            makeFile("b.gif", "image/gif", 1 * MB),
        ];
        const result = validateImageFiles(files);
        expect(result.valid).toBe(false);
        expect(result.message).toContain("b.gif");
    });

    it("rejeita quando o total combinado ultrapassa os 60MB, mesmo com ficheiros individualmente válidos", () => {
        const files = [
            makeFile("a.png", "image/png", 14 * MB),
            makeFile("b.png", "image/png", 14 * MB),
            makeFile("c.png", "image/png", 14 * MB),
            makeFile("d.png", "image/png", 14 * MB),
            makeFile("e.png", "image/png", 14 * MB),
        ];
        const result = validateImageFiles(files);
        expect(result.valid).toBe(false);
        expect(result.message).toContain("60MB");
    });
});

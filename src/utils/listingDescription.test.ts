import { describe, expect, it } from "vitest";
import { generateListingDescription } from "./listingDescription";

describe("generateListingDescription", () => {
    it("contém o número de páginas correto", () => {
        const text = generateListingDescription({
            theme: "Summer",
            pageCount: 24,
            audience: "all",
        });
        expect(text).toContain("24 pages");
    });

    it("contém sempre o aviso de produto digital", () => {
        (["kids", "adults", "all"] as const).forEach((audience) => {
            const text = generateListingDescription({ theme: "Ocean", pageCount: 10, audience });
            expect(text).toContain("DIGITAL PRODUCT");
            expect(text).toContain("downloadable PDF");
        });
    });

    it("muda a frase de público-alvo consoante audience", () => {
        const kids = generateListingDescription({ theme: "Space", pageCount: 10, audience: "kids" });
        const adults = generateListingDescription({ theme: "Space", pageCount: 10, audience: "adults" });
        expect(kids).not.toBe(adults);
        expect(kids).toContain("kids");
        expect(adults).toContain("adults");
    });

    it("não rebenta e produz texto não vazio com theme vazio", () => {
        const text = generateListingDescription({ theme: "", pageCount: 0, audience: "all" });
        expect(text.length).toBeGreaterThan(0);
        expect(text).toContain("Coloring Book");
    });

    it("omite a linha de páginas quando pageCount é 0", () => {
        const text = generateListingDescription({ theme: "Space", pageCount: 0, audience: "all" });
        expect(text).not.toContain("pages");
    });

    it("por omissão descreve só o formato A4", () => {
        const text = generateListingDescription({ theme: "Space", pageCount: 10, audience: "all" });
        expect(text).toContain("A4 (21 x 29.7 cm)");
        expect(text).not.toContain("Letter");
    });

    it("descreve só Letter quando é o único formato", () => {
        const text = generateListingDescription({
            theme: "Space",
            pageCount: 10,
            audience: "all",
            paperSizes: ["letter"],
        });
        expect(text).toContain("US Letter (8.5 x 11 in)");
        expect(text).not.toContain("A4");
    });

    it("menciona os dois formatos quando ambos são gerados", () => {
        const text = generateListingDescription({
            theme: "Space",
            pageCount: 10,
            audience: "all",
            paperSizes: ["a4", "letter"],
        });
        expect(text).toContain("A4 (21 x 29.7 cm)");
        expect(text).toContain("US Letter (8.5 x 11 in)");
    });
});

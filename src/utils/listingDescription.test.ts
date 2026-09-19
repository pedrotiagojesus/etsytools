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
});

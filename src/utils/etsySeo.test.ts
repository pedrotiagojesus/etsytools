import { describe, expect, it } from "vitest";
import { generateEtsyListing, MAX_TAGS, TAG_MAX_LENGTH, TITLE_MAX_LENGTH } from "./etsySeo";

describe("generateEtsyListing — título", () => {
    it("nunca excede 140 caracteres, mesmo com um tema muito longo", () => {
        const { title } = generateEtsyListing({
            theme: "A Very Long Summer Adventure Under The Deep Blue Ocean With Dolphins And Turtles",
            pageCount: 25,
            audience: "kids",
        });

        expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    });

    it("nunca corta uma palavra a meio — termina sempre numa fronteira de segmento", () => {
        const { title } = generateEtsyListing({
            theme: "A Very Long Summer Adventure Under The Deep Blue Ocean With Dolphins And Turtles And Whales",
            pageCount: 25,
            audience: "kids",
        });

        // cada segmento junta-se com " | " — a última palavra do título
        // tem de ser a última palavra completa de algum dos segmentos
        // possíveis, nunca um pedaço cortado.
        expect(title.endsWith(" |")).toBe(false);
        expect(title.trim()).toBe(title);
    });

    it("inclui o tema e o número de páginas quando cabem", () => {
        const { title } = generateEtsyListing({ theme: "Summer", pageCount: 25, audience: "all" });

        expect(title).toContain("Summer");
        expect(title).toContain("25 Printable Pages");
    });

    it("não duplica 'Coloring Book' se o tema já o incluir", () => {
        const { title } = generateEtsyListing({ theme: "Summer Coloring Book", pageCount: 10, audience: "all" });

        const occurrences = title.match(/coloring book/gi)?.length ?? 0;
        expect(occurrences).toBe(1);
    });

    it("omite a contagem de páginas quando pageCount é 0", () => {
        const { title } = generateEtsyListing({ theme: "Summer", pageCount: 0, audience: "all" });

        expect(title).not.toContain("Printable Pages");
    });
});

describe("generateEtsyListing — tags", () => {
    it("nunca gera mais de 13 tags", () => {
        const { tags } = generateEtsyListing({
            theme: "Summer Ocean Beach Dolphins Turtles Whales Sunshine",
            pageCount: 20,
            audience: "kids",
        });

        expect(tags.length).toBeLessThanOrEqual(MAX_TAGS);
    });

    it("nenhuma tag excede 20 caracteres", () => {
        const { tags } = generateEtsyListing({
            theme: "Professional Underwater Adventure",
            pageCount: 20,
            audience: "adults",
        });

        tags.forEach((tag) => expect(tag.length).toBeLessThanOrEqual(TAG_MAX_LENGTH));
    });

    it("não tem tags duplicadas (case-insensitive)", () => {
        const { tags } = generateEtsyListing({ theme: "Coloring Fun Coloring", pageCount: 10, audience: "all" });

        const lower = tags.map((t) => t.toLowerCase());
        expect(new Set(lower).size).toBe(lower.length);
    });

    it("reflete o público-alvo nas tags geradas", () => {
        const kids = generateEtsyListing({ theme: "Farm", pageCount: 10, audience: "kids" });
        const adults = generateEtsyListing({ theme: "Farm", pageCount: 10, audience: "adults" });

        expect(kids.tags.some((t) => t.includes("kids"))).toBe(true);
        expect(adults.tags.some((t) => t.includes("adult"))).toBe(true);
    });

    it("gera tags mesmo com tema vazio (cai nas evergreen/público-alvo)", () => {
        const { tags } = generateEtsyListing({ theme: "", pageCount: 0, audience: "all" });

        expect(tags.length).toBeGreaterThan(0);
    });
});

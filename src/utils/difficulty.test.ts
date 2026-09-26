import { describe, expect, it } from "vitest";
import { countByDifficulty, suggestAudience, type JobAnalysis } from "./difficulty";

const page = (index: number, difficulty: "easy" | "medium" | "hard") => ({
    index,
    difficulty,
    score: 0.5,
    metrics: { regions: 10, segments: 100, inkRatio: 0.1 },
});

describe("suggestAudience", () => {
    it("fácil sugere crianças, difícil sugere adultos, médio todas as idades", () => {
        expect(suggestAudience("easy")).toBe("kids");
        expect(suggestAudience("hard")).toBe("adults");
        expect(suggestAudience("medium")).toBe("all");
    });
});

describe("countByDifficulty", () => {
    it("conta as páginas por nível", () => {
        const analysis: JobAnalysis = {
            overall: "medium",
            pages: [page(1, "easy"), page(2, "easy"), page(3, "hard")],
        };
        expect(countByDifficulty(analysis)).toEqual({ easy: 2, medium: 0, hard: 1 });
    });
});

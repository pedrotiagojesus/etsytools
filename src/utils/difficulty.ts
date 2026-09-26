import type { EtsyAudience } from "./etsySeo";

// Espelha studio-base-api/src/jobs/types.ts (JobAnalysis), devolvido em
// GET .../status quando o job termina.
export type Difficulty = "easy" | "medium" | "hard";

export interface PageAnalysis {
    /** 1-based, igual ao Images/page-N.png (a página de rosto não conta). */
    index: number;
    difficulty: Difficulty;
    score: number;
    metrics: {
        regions: number;
        segments: number;
        inkRatio: number;
    };
}

export interface JobAnalysis {
    overall: Difficulty;
    pages: PageAnalysis[];
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
};

export const suggestAudience = (difficulty: Difficulty): EtsyAudience => {
    if (difficulty === "easy") return "kids";
    if (difficulty === "hard") return "adults";
    return "all";
};

export const countByDifficulty = (analysis: JobAnalysis): Record<Difficulty, number> => {
    const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    for (const page of analysis.pages) counts[page.difficulty] += 1;
    return counts;
};

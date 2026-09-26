// Espelha PAPER_SIZES/PAPER_LABELS de studio-base-api/src/config/pdf.ts.
export type PaperSize = "a4" | "letter";

export const PAPER_SIZES: readonly PaperSize[] = ["a4", "letter"];

export const PAPER_LABELS: Record<PaperSize, string> = {
    a4: "A4",
    letter: "Letter",
};

// Espelha PAPER_SIZES de studio-base-api/src/modules/imgtools/config/pdf.ts
// (o backend aceita "a4" e "letter" no campo paperSizes).
export type PaperSize = "a4" | "letter";

export const PAPER_SIZES: readonly PaperSize[] = ["a4", "letter"];

export const PAPER_LABELS: Record<PaperSize, string> = {
    a4: "A4",
    letter: "US Letter",
};

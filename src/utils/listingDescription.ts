/**
 * Gerador de descrição da ficha do Etsy — baseado em regras, não IA, tal
 * como o etsySeo.ts. O texto fica em inglês pela mesma razão: é a língua em
 * que o Etsy realmente vende.
 */

import type { EtsyAudience } from "./etsySeo";
import type { PaperSize } from "./paperSizes";

export interface ListingDescriptionInput {
    theme: string;
    pageCount: number;
    audience: EtsyAudience;
    /** Formatos de papel gerados no ZIP; por omissão só A4. */
    paperSizes?: PaperSize[];
}

const AUDIENCE_DESCRIPTION_PHRASE: Record<EtsyAudience, string> = {
    kids: "Perfect for kids who love coloring, drawing, and creative play.",
    adults: "A relaxing coloring experience designed for adults looking to unwind.",
    all: "Fun for the whole family, no matter the age.",
};

const A4_SIZE = "A4 (21 x 29.7 cm)";
const LETTER_SIZE = "US Letter (8.5 x 11 in)";

const describePaperSizes = (paperSizes: PaperSize[]): string => {
    const hasA4 = paperSizes.includes("a4");
    const hasLetter = paperSizes.includes("letter");

    if (hasA4 && hasLetter) return `✓ Includes both ${A4_SIZE} and ${LETTER_SIZE} versions`;
    if (hasLetter) return `✓ Standard ${LETTER_SIZE} size`;
    return `✓ Standard ${A4_SIZE} size`;
};

export const generateListingDescription = (
    input: ListingDescriptionInput,
): string => {
    const theme = input.theme.trim() || "Coloring Book";

    const paragraphs = [
        `${theme} Coloring Book — Printable PDF`,
        AUDIENCE_DESCRIPTION_PHRASE[input.audience],
        [
            input.pageCount > 0 ? `✓ ${input.pageCount} pages` : "",
            describePaperSizes(input.paperSizes ?? ["a4"]),
            "✓ High-resolution, ready to print at home",
        ]
            .filter(Boolean)
            .join("\n"),
        "THIS IS A DIGITAL PRODUCT — no physical item will be shipped. You'll receive a downloadable PDF file after purchase.",
        "For personal use only. Not for commercial resale or redistribution.",
    ];

    return paragraphs.join("\n\n");
};

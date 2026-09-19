export interface CannedResponse {
    id: string;
    question: string;
    answer: string;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Conteúdo pré-preenchido em inglês — são respostas coladas diretamente em
 * mensagens a compradores de uma ficha que também está em inglês, mesma
 * razão já usada em EtsySeoPanel/listingDescription (i5/i6).
 */
export const createDefaultResponses = (): CannedResponse[] => [
    {
        id: generateId(),
        question: "Does this work for A4 paper?",
        answer: "Yes! This coloring book is designed for standard A4 paper (21 x 29.7 cm), so it prints perfectly at home or at any print shop.",
    },
    {
        id: generateId(),
        question: "How do I print it?",
        answer: "After your purchase, download the PDF file and print it at 100% scale (no \"fit to page\" scaling) on regular printer paper or cardstock for best results.",
    },
    {
        id: generateId(),
        question: "Can I use this for my business / resell it?",
        answer: "This file is for personal use only. Reselling, redistributing, or sharing the file (printed or digital) is not permitted. Thank you for understanding!",
    },
    {
        id: generateId(),
        question: "Can I get a refund?",
        answer: "Since this is a digital, instant-download product, I'm unable to offer refunds once the file has been downloaded. If something isn't right, please message me and I'll do my best to help.",
    },
    {
        id: generateId(),
        question: "I'm having trouble opening the file",
        answer: "Sorry about that! Please make sure you're opening the PDF with a program like Adobe Acrobat Reader (free) rather than your browser. If it still doesn't work, send me a message and I'll help you sort it out.",
    },
    {
        id: generateId(),
        question: "Can you add an extra page / customize it?",
        answer: "I'd love to help! Send me a message with the details you'd like and I'll let you know if a custom version is possible.",
    },
    {
        id: generateId(),
        question: "Thank you message after purchase",
        answer: "Thank you so much for your purchase! I really hope you enjoy coloring these pages. If you have any questions or run into any issues, just send me a message — I'm happy to help.",
    },
];

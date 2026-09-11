/**
 * Gerador de título/tags SEO para fichas do Etsy — baseado em regras, não IA
 * (grátis, instantâneo, sem chamadas de rede). O conteúdo gerado fica em
 * inglês de propósito: é a língua em que o Etsy realmente vende, e os
 * próprios templates de mockup já usam texto em inglês (ex: "Summer
 * Coloring Book", "Instant Download").
 */

export type EtsyAudience = "kids" | "adults" | "all";

export interface EtsyListingInput {
    /** Tema/nome do produto — normalmente o que já vai no campo "Título". */
    theme: string;
    /** Número de páginas do livro (ex: images.length no Gerador de Produto). */
    pageCount: number;
    audience: EtsyAudience;
}

export interface EtsyListingResult {
    title: string;
    tags: string[];
}

/** Regras reais da plataforma. */
export const TITLE_MAX_LENGTH = 140;
export const TAG_MAX_LENGTH = 20;
export const MAX_TAGS = 13;

export const AUDIENCE_LABELS: Record<EtsyAudience, string> = {
    kids: "Crianças",
    adults: "Adultos",
    all: "Todas as idades",
};

const AUDIENCE_TITLE_PHRASE: Record<EtsyAudience, string> = {
    kids: "Kids Activity Book",
    adults: "Adult Coloring Pages",
    all: "Coloring Pages for All Ages",
};

const AUDIENCE_TAGS: Record<EtsyAudience, string[]> = {
    kids: ["kids coloring", "kids activity", "children coloring", "coloring for kids"],
    adults: ["adult coloring", "stress relief", "relaxing coloring", "adult activity"],
    all: ["family coloring", "coloring for all", "all ages coloring"],
};

const EVERGREEN_TAGS = [
    "coloring book",
    "printable pdf",
    "instant download",
    "digital download",
    "coloring pages",
    "diy coloring book",
];

const STOPWORDS = new Set([
    "the", "a", "an", "and", "of", "for", "with", "to", "in", "on",
    "book", "coloring", "pages", "page", "printable", "pdf",
]);

/**
 * "Tema Coloring Book" — mas evita duplicar "Coloring Book" se o utilizador
 * já o incluiu no próprio título (ex: "Summer Coloring Book").
 */
const themeSegment = (theme: string): string => {
    const trimmed = theme.trim();
    if (!trimmed) return "";
    return /coloring\s*book/i.test(trimmed) ? trimmed : `${trimmed} Coloring Book`;
};

/**
 * Junta segmentos com " | ", parando assim que o próximo segmento inteiro
 * não couber — nunca corta um segmento a meio, e mantém sempre os
 * segmentos mais importantes primeiro (a ordem de entrada é a prioridade).
 */
const buildTitle = (segments: string[], maxLength: number): string => {
    let result = "";
    for (const segment of segments) {
        if (!segment) continue;
        const candidate = result ? `${result} | ${segment}` : segment;
        if (candidate.length > maxLength) break;
        result = candidate;
    }
    return result;
};

const themeWords = (theme: string): string[] =>
    theme
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 1 && !STOPWORDS.has(word));

const themeTagCandidates = (theme: string): string[] => {
    const tags: string[] = [];
    for (const word of themeWords(theme)) {
        tags.push(`${word} coloring`);
        tags.push(`${word} pages`);
    }
    return tags;
};

/** Aceita a tag se couber no limite da plataforma; nunca a corta a meio. */
const fitTag = (tag: string): string | null => {
    const trimmed = tag.trim();
    if (!trimmed || trimmed.length > TAG_MAX_LENGTH) return null;
    return trimmed;
};

const collectTags = (input: EtsyListingInput): string[] => {
    const candidates = [
        ...themeTagCandidates(input.theme),
        ...AUDIENCE_TAGS[input.audience],
        ...EVERGREEN_TAGS,
    ];

    const seen = new Set<string>();
    const tags: string[] = [];

    for (const candidate of candidates) {
        const fitted = fitTag(candidate);
        if (!fitted) continue;

        const key = fitted.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        tags.push(fitted);
        if (tags.length >= MAX_TAGS) break;
    }

    return tags;
};

export const generateEtsyListing = (input: EtsyListingInput): EtsyListingResult => {
    const segments = [
        themeSegment(input.theme),
        input.pageCount > 0 ? `${input.pageCount} Printable Pages` : "",
        AUDIENCE_TITLE_PHRASE[input.audience],
        "Instant Download PDF",
        "Printable Coloring Sheets",
    ];

    return {
        title: buildTitle(segments, TITLE_MAX_LENGTH),
        tags: collectTags(input),
    };
};

import { ETSY_MAX_TAGS, ETSY_TAG_MAX_LENGTH } from "@utils/etsy-limits";

// Templates (edit these files to change the generated text)
import titleTemplate from "@templates/listing/title.txt?raw";
import tagsTemplate from "@templates/listing/tags.txt?raw";
import descriptionTemplate from "@templates/listing/description.txt?raw";

/**
 * Values available in the listing templates as {titulo}, {paginas},
 * {descricao} and {tema}.
 */
export interface ListingValues {
    titulo: string;
    paginas: string;
    descricao: string;
    tema: string;
}

export interface ListingText {
    title: string;
    tags: string[];
    description: string;
}

const PLACEHOLDER = /\{(\w+)\}/g;

const isListingKey = (key: string, values: ListingValues): key is keyof ListingValues => key in values;

const fillTemplate = (template: string, values: ListingValues): string =>
    template.replace(PLACEHOLDER, (match, key: string) => (isListingKey(key, values) ? values[key] : match));

// A template line is skipped when one of its placeholders has no value,
// e.g. "{tema} coloring" without a theme.
const hasEmptyPlaceholder = (line: string, values: ListingValues): boolean =>
    Array.from(line.matchAll(PLACEHOLDER)).some(([, key]) => key !== undefined && isListingKey(key, values) && !values[key].trim());

export const normalizeTag = (tag: string): string => tag.trim().replace(/\s+/g, " ").toLowerCase();

export const isValidTag = (tag: string): boolean => tag.length > 0 && tag.length <= ETSY_TAG_MAX_LENGTH;

/**
 * Keywords typed by the user come first, then the template tags. Duplicates
 * and tags over Etsy's length limit are dropped; at most 13 are kept.
 */
export const buildTags = (keywords: string[], values: ListingValues): string[] => {
    const templateTags = tagsTemplate
        .split("\n")
        .filter((line) => line.trim() && !hasEmptyPlaceholder(line, values))
        .map((line) => fillTemplate(line, values));

    const uniqueTags = Array.from(new Set([...keywords, ...templateTags].map(normalizeTag)));
    return uniqueTags.filter(isValidTag).slice(0, ETSY_MAX_TAGS);
};

export const buildListingText = (values: ListingValues, keywords: string[]): ListingText => ({
    title: fillTemplate(titleTemplate.trim(), values).replace(/\s+/g, " "),
    tags: buildTags(keywords, values),
    // An empty {descricao} would leave a gap of blank lines
    description: fillTemplate(descriptionTemplate.trim(), values).replace(/\n{3,}/g, "\n\n"),
});

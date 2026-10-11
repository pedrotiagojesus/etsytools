/**
 * Etsy limits that affect what this tool produces. Check them against
 * Etsy's seller help if a listing is rejected — they can change.
 */

// Digital listings: up to 5 files, each at most 20 MB
export const ETSY_MAX_DIGITAL_FILES = 5;
export const ETSY_MAX_DIGITAL_FILE_BYTES = 20 * 1024 * 1024;

export const ETSY_TITLE_MAX_LENGTH = 140;
export const ETSY_MAX_TAGS = 13;
export const ETSY_TAG_MAX_LENGTH = 20;

const BYTES_PER_MB = 1024 * 1024;

export const formatMegabytes = (bytes: number): string => `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;

/**
 * Decoded size of a base64 data URL. PNGs are already compressed, so a ZIP
 * of them ends up about this size.
 */
export const estimateDataUrlBytes = (dataUrl: string): number => {
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    return (base64.length * 3) / 4 - padding;
};

export const exceedsDigitalFileLimit = (bytes: number): boolean => bytes > ETSY_MAX_DIGITAL_FILE_BYTES;

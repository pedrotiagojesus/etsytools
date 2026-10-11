export const DEFAULT_MOCKUP_TEMPLATE = "01-before-after";

// Element captured when a slide is exported as an image
export const MOCKUP_PREVIEW_DISPLAY_ID = "preview-display";

export type MockupTab = "html" | "css" | "images" | "patterns" | "fonts";

// Slides created by "Criar slides automáticos", in listing order. Edit this
// list to change the default set (01-before-after is left out: it needs a
// coloured version of a page).
export const AUTO_SLIDE_TEMPLATES = ["13-paris", "02-contact-sheet", "03-product-details", "17-sketchbook-stack"];

const IMAGE_SLOT_SELECTOR = "div[data-img]";

// Processed pages are 2480x3508; this is enough for a 3000x2250 mockup
// without making the slide HTML huge.
export const MOCKUP_IMAGE_MAX_SIZE = 1600;

export interface MockupSlide {
    id: string;
    template: string;
    html: string;
    css: string;
    // Indexed by the template's data-pattern divs: pattern name ("" = none)
    // and the CSS scoped to that div (".pattern-N")
    activePatterns: string[];
    patternCssList: string[];
}

export interface Pattern {
    name: string;
    css: string;
}

const templateFiles = import.meta.glob<string>("/src/templates/mockups/*/template.{html,css}", {
    query: "?raw",
    import: "default",
});

const patternFiles = import.meta.glob<string>("/src/templates/patterns/*.css", {
    query: "?raw",
    import: "default",
});

const PATTERN_STYLE_PREFIX = "pattern-style-";

const folderName = (path: string): string => path.split("/").slice(-2, -1)[0] ?? "";

const createSlideId = (): string => crypto.randomUUID();

/**
 * Names of the available mockup templates (folders in src/templates/mockups), sorted.
 */
export const listMockupTemplates = (): string[] =>
    Array.from(new Set(Object.keys(templateFiles).map(folderName))).sort();

const loadTemplateFile = async (template: string, extension: "html" | "css"): Promise<string> => {
    const loader = templateFiles[`/src/templates/mockups/${template}/template.${extension}`];
    if (!loader) {
        throw new Error(`O template "${template}" não tem o ficheiro template.${extension}.`);
    }
    return loader();
};

/**
 * Creates a new slide with the template's original HTML and CSS.
 */
export const createSlide = async (template: string): Promise<MockupSlide> => {
    const [html, css] = await Promise.all([loadTemplateFile(template, "html"), loadTemplateFile(template, "css")]);

    return { id: createSlideId(), template, html, css, activePatterns: [], patternCssList: [] };
};

/**
 * Sets the background image of one image slot (div[data-img], by index) of a
 * slide's HTML and returns the new HTML.
 */
export const setSlotImage = (html: string, slotIndex: number, imageUrl: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const slot = doc.querySelectorAll<HTMLDivElement>(IMAGE_SLOT_SELECTOR)[slotIndex];
    if (!slot) return html;

    slot.style.backgroundImage = `url(${imageUrl})`;
    return doc.body.innerHTML;
};

export const countImageSlots = (html: string): number =>
    new DOMParser().parseFromString(html, "text/html").querySelectorAll(IMAGE_SLOT_SELECTOR).length;

/**
 * Creates the AUTO_SLIDE_TEMPLATES slides with their image slots filled with
 * the given images, in order. Each slide continues where the previous one
 * stopped, and the images repeat when there are more slots than images.
 */
export const createAutoSlides = async (images: string[]): Promise<MockupSlide[]> => {
    const slides = await Promise.all(AUTO_SLIDE_TEMPLATES.map(createSlide));
    if (images.length === 0) return slides;

    let nextImage = 0;
    return slides.map((slide) => {
        let html = slide.html;
        const slotCount = countImageSlots(html);

        for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
            const image = images[nextImage % images.length];
            if (image) html = setSlotImage(html, slotIndex, image);
            nextImage += 1;
        }

        return { ...slide, html };
    });
};

export const duplicateSlide = (slide: MockupSlide): MockupSlide => ({
    ...slide,
    id: createSlideId(),
    activePatterns: [...slide.activePatterns],
    patternCssList: [...slide.patternCssList],
});

/**
 * Loads every background pattern and registers its CSS once as a <link>, so
 * the pattern thumbnails (".<name>-pattern") render in the picker.
 */
export const loadPatternLibrary = async (): Promise<Pattern[]> => {
    const entries = Object.entries(patternFiles);
    const patterns = await Promise.all(
        entries.map(async ([path, loader]) => {
            const css = await loader();
            const name = path.split("/").pop()?.replace(".css", "") ?? "unknown";
            return { name, css };
        }),
    );

    patterns.forEach(({ name, css }) => {
        if (document.querySelector(`link[data-pattern="${name}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = URL.createObjectURL(new Blob([css], { type: "text/css" }));
        link.setAttribute("data-pattern", name);
        document.head.appendChild(link);
    });

    return patterns;
};

export const patternStyleId = (index: number): string => `${PATTERN_STYLE_PREFIX}${index}`;

/**
 * Replaces the injected pattern <style> tags with the ones of the given slide.
 * Pattern classes are scoped by index (".pattern-N"), so only one slide's
 * patterns can be in the page at a time.
 */
export const applySlidePatternStyles = (slide: MockupSlide): void => {
    document.querySelectorAll(`style[id^="${PATTERN_STYLE_PREFIX}"]`).forEach((style) => style.remove());

    slide.patternCssList.forEach((css, index) => {
        if (!css) return;

        const style = document.createElement("style");
        style.id = patternStyleId(index);
        style.innerHTML = css;
        document.head.appendChild(style);
    });
};

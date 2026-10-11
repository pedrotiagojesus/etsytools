export const DEFAULT_MOCKUP_TEMPLATE = "01-before-after";

// Element captured when a slide is exported as an image
export const MOCKUP_PREVIEW_DISPLAY_ID = "preview-display";

export type MockupTab = "html" | "css" | "images" | "patterns" | "fonts";

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

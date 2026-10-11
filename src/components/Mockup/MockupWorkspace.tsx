import { useEffect, useMemo, useRef, useState } from "react";
import type { SetStateAction } from "react";

// Components
import MockupPreview from "@components/Mockup/MockupPreview";
import MockupEditor from "@components/Mockup/MockupEditor";
import MockupImages from "@components/Mockup/MockupImages";
import MockupPatterns from "@components/Mockup/MockupPatterns";
import MockupFonts from "@components/Mockup/MockupFonts";

// Utils
import {
    applySlidePatternStyles,
    MOCKUP_PREVIEW_DISPLAY_ID,
    pruneSlideImages,
    resolveSlideImages,
    setSlotImage,
} from "@utils/mockup-slides";
import type { MockupSlide, MockupTab, Pattern } from "@utils/mockup-slides";
import type { ProductPage } from "@utils/imgtools-api";

const TABS: { id: MockupTab; label: string }[] = [
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "images", label: "Imagens" },
    { id: "patterns", label: "Padrões" },
    { id: "fonts", label: "Fontes" },
];

interface MockupWorkspaceProps {
    slide: MockupSlide;
    onSlideChange: (slideId: string, update: (slide: MockupSlide) => Partial<MockupSlide>) => void;
    patterns: Pattern[];
    pages: ProductPage[];
    activeTab: MockupTab;
    onTabChange: (tab: MockupTab) => void;
}

const resolveList = (value: SetStateAction<string[]>, previous: string[]): string[] =>
    typeof value === "function" ? value(previous) : value;

/**
 * Editor of a single slide. Render it with `key={slide.id}` so switching
 * slides remounts it: pending editor changes are flushed to the slide they
 * belong to and the slide's pattern styles are injected again.
 */
const MockupWorkspace = ({ slide, onSlideChange, patterns, pages, activeTab, onTabChange }: MockupWorkspaceProps) => {
    const [images, setImages] = useState<{ name: string; bg: string | null }[]>([]);
    const [patternsInput, setPatternsInput] = useState<{ name: string }[]>([]);
    const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
    const initialSlide = useRef(slide);

    useEffect(() => {
        applySlidePatternStyles(initialSlide.current);
    }, []);

    const slideId = slide.id;
    // Images removed from the HTML (by editing or replacing them) are dropped
    const setHtml = (html: string) =>
        onSlideChange(slideId, (current) => ({ html, images: pruneSlideImages(html, current.images) }));
    const setImage = (slotIndex: number, imageUrl: string) =>
        onSlideChange(slideId, (current) => setSlotImage(current, slotIndex, imageUrl));
    const displayHtml = useMemo(() => resolveSlideImages(slide.html, slide.images), [slide.html, slide.images]);
    const setCss = (css: string) => onSlideChange(slideId, () => ({ css }));
    const setActivePatterns = (value: SetStateAction<string[]>) =>
        onSlideChange(slideId, (current) => ({ activePatterns: resolveList(value, current.activePatterns) }));
    const setPatternCssList = (value: SetStateAction<string[]>) =>
        onSlideChange(slideId, (current) => ({ patternCssList: resolveList(value, current.patternCssList) }));

    return (
        <div className="row main-row">
            <div className="col-xl-7 h-100">
                <MockupPreview
                    previewDisplayId={MOCKUP_PREVIEW_DISPLAY_ID}
                    previewHtml={displayHtml}
                    previewCss={slide.css}
                />
            </div>

            <div className="col-xl-5 h-100 d-flex flex-column">
                <div className="nav nav-pills mockup-tabs" role="tablist">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                            aria-selected={activeTab === tab.id}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mockup-tab-panel flex-grow-1 overflow-auto" role="tabpanel">
                    {activeTab === "html" && <MockupEditor mode="html" preview={slide.html} setPreview={setHtml} />}
                    {activeTab === "css" && <MockupEditor mode="css" preview={slide.css} setPreview={setCss} />}
                    {activeTab === "images" && (
                        <div id="image">
                            <MockupImages
                                images={images}
                                setImages={setImages}
                                previewHtml={slide.html}
                                slideImages={slide.images}
                                onImageChange={setImage}
                                pages={pages}
                            />
                        </div>
                    )}
                    {activeTab === "patterns" && (
                        <div id="pattern">
                            <MockupPatterns
                                previewCss={slide.css}
                                previewHtml={slide.html}
                                previewDisplayHtml={displayHtml}
                                setPreviewHtml={setHtml}
                                setPatternsInput={setPatternsInput}
                                patternsInput={patternsInput}
                                patterns={patterns}
                                activePatterns={slide.activePatterns}
                                setActivePatterns={setActivePatterns}
                                patternCssList={slide.patternCssList}
                                setPatternCssList={setPatternCssList}
                                currentEditingIndex={currentEditingIndex}
                                setCurrentEditingIndex={setCurrentEditingIndex}
                            />
                        </div>
                    )}
                    {activeTab === "fonts" && <MockupFonts />}
                </div>
            </div>
        </div>
    );
};

export default MockupWorkspace;

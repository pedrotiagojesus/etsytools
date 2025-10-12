import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import MockupEditor from "./MockupEditor";

interface Pattern {
    name: string;
    css: string;
}

interface MockupPatternsProps {
    previewHtml: string;
    setPreviewHtml: (html: string) => void;
    patternsInput: { name: string }[];
    setPatternsInput: (patterns: { name: string }[]) => void;
    patterns: Pattern[];
}

const MockupPatterns: React.FC<MockupPatternsProps> = ({
    previewHtml,
    setPreviewHtml,
    patternsInput,
    setPatternsInput,
    patterns,
}) => {
    const [activePatterns, setActivePatterns] = useState<string[]>([]);
    const [patternCssList, setPatternCssList] = useState<string[]>([]);

    useEffect(() => {
        if (!previewHtml) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const ptns = divs.map((div, i) => ({
            name: div.getAttribute("data-title") ?? `Padrão ${i + 1}`,
        }));

        setPatternsInput(ptns);

        const currentActive = divs.map((div) => {
            const active = Array.from(div.classList).find((cls) => cls.endsWith("-pattern"));
            return active ? active.replace("-pattern", "") : "";
        });

        setActivePatterns(currentActive);
        setPatternCssList(divs.map(() => ""));
    }, [previewHtml]);

    const handlePatternSelect = (patternName: string, index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");

        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];
        const targetDiv = divs[index];

        if (targetDiv) {
            targetDiv.classList.forEach((cls) => {
                if (cls.endsWith("-pattern")) targetDiv.classList.remove(cls);
            });

            const patternClass = `${patternName}-pattern`;
            targetDiv.classList.add(patternClass);

            setPreviewHtml(doc.documentElement.innerHTML);

            setActivePatterns((prev) => {
                const newState = [...prev];
                newState[index] = patternName;
                return newState;
            });

            const selectedPattern = patterns.find((p) => p.name === patternName);
            if (selectedPattern) {
                setPatternCssList((prev) => {
                    const newState = [...prev];
                    newState[index] = selectedPattern.css;
                    return newState;
                });
            }
        }
    };

    return (
        <div className="pattern-slider">
            {patternsInput.length ? (
                patternsInput.map((data, patternIndex) => (
                    <div className="pattern-block" key={patternIndex}>
                        <h5>{data.name}</h5>
                        <Swiper modules={[Navigation]} spaceBetween={5} slidesPerView={5} navigation loop={true}>
                            {patterns.map((pattern, index) => {
                                const isActive = activePatterns[patternIndex] === pattern.name;
                                return (
                                    <SwiperSlide key={index}>
                                        <div
                                            className={`pattern-preview ${pattern.name}-pattern ${
                                                isActive ? "active" : ""
                                            }`}
                                            title={pattern.name}
                                            onClick={() => handlePatternSelect(pattern.name, patternIndex)}
                                        ></div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>

                        <div className="pattern-editor">
                            <MockupEditor
                                mode="css"
                                preview={patternCssList[patternIndex] || ""}
                                setPreview={(css) =>
                                    setPatternCssList((prev) => {
                                        const newState = [...prev];
                                        newState[patternIndex] = css ?? "";
                                        return newState;
                                    })
                                }
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted">Nenhum padrão encontrado.</p>
            )}
        </div>
    );
};

export default MockupPatterns;

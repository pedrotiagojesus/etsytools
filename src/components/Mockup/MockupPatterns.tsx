// src/components/Mockup/MockupPatterns.tsx

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import MockupEditor from "./MockupEditor";
import injectPatternStyle from "../../utils/injectPatternStyle";

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

    // Detecta padrões existentes no HTML e inicializa inputs
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
            const patternClass = Array.from(div.classList).find((cls) => cls.startsWith("pattern-"));
            return patternClass ? patternClass.replace("pattern-", "") : "";
        });

        setActivePatterns(currentActive);
        setPatternCssList((prev) => {
            return prev.length === 0 ? divs.map(() => "") : prev;
        });
    }, [previewHtml]);

    // Injeção dinâmica de CSS customizado por instância
    useEffect(() => {
        patternCssList.forEach((cssContent, index) => {
            if (!cssContent) return;

            const styleId = `pattern-style-${index}`;
            injectPatternStyle(cssContent, styleId);
        });
    }, [patternCssList]);

    // Troca o padrão de um elemento e injeta CSS escopado
    const handlePatternSelect = (patternName: string, index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const targetDiv = divs[index];
        if (targetDiv) {
            // Remove classes antigas como pattern-0, pattern-1, etc
            targetDiv.classList.forEach((cls) => {
                if (cls.startsWith("pattern-")) {
                    targetDiv.classList.remove(cls);
                }
            });

            const newClass = `pattern-${index}`;
            targetDiv.classList.add(newClass);

            // Atualiza HTML do preview
            setPreviewHtml(doc.documentElement.innerHTML);

            // Atualiza padrão selecionado para este bloco
            setActivePatterns((prev) => {
                const newState = [...prev];
                newState[index] = patternName;
                return newState;
            });

            // Substitui o seletor do CSS original pelo escopado (.pattern-N)
            const selectedPattern = patterns.find((p) => p.name === patternName);
            if (selectedPattern) {
                const adjustedCss = selectedPattern.css.replace(
                    new RegExp(`\\.${patternName}-pattern`, "g"),
                    `.pattern-${index}`
                );

                setPatternCssList((prev) => {
                    const newState = [...prev];
                    newState[index] = adjustedCss;
                    return newState;
                });
            }
        }
    };

    const handlePatternRemove = (index: number) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(previewHtml, "text/html");
        const divs = Array.from(doc.querySelectorAll("div[data-pattern]")) as HTMLDivElement[];

        const targetDiv = divs[index];
        if (targetDiv) {
            // Remove qualquer classe pattern-*
            targetDiv.classList.forEach((cls) => {
                if (cls.startsWith("pattern-")) {
                    targetDiv.classList.remove(cls);
                }
            });

            // Atualiza HTML do preview
            setPreviewHtml(doc.documentElement.innerHTML);

            // Limpa estado
            setActivePatterns((prev) => {
                const newState = [...prev];
                newState[index] = "";
                return newState;
            });

            setPatternCssList((prev) => {
                const newState = [...prev];
                newState[index] = "";
                return newState;
            });

            // Remove style do head
            const styleEl = document.getElementById(`pattern-style-${index}`);
            if (styleEl) {
                styleEl.remove();
            }
        }
    };

    return (
        <div className="pattern-slider">
            {patternsInput.length ? (
                patternsInput.map((data, patternIndex) => (
                    <div className="pattern-block" key={patternIndex}>
                        <h5>{data.name}</h5>
                        <Swiper modules={[Navigation]} spaceBetween={5} slidesPerView={8} navigation>
                            <SwiperSlide key="none">
                                <div
                                    className={`pattern-preview none-pattern ${
                                        !activePatterns[patternIndex] ? "active" : ""
                                    }`}
                                    title="Nenhum"
                                    onClick={() => handlePatternRemove(patternIndex)}
                                >
                                    Nenhum
                                </div>
                            </SwiperSlide>
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
                        <div className="accordion accordion-flush" id={`accordionFlush-${patternIndex}`}>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#flush-collapse-${patternIndex}`}
                                        aria-expanded="false"
                                        aria-controls={`flush-collapse-${patternIndex}`}
                                    >
                                        Editar
                                    </button>
                                </h2>
                                <div
                                    id={`flush-collapse-${patternIndex}`}
                                    className="accordion-collapse collapse"
                                    data-bs-parent={`#accordionFlush-${patternIndex}`}
                                >
                                    <div className="accordion-body">
                                        {!activePatterns[patternIndex] ? (
                                            <div className="alert alert-warning" role="alert">
                                                Selecione um padrão antes de editar o CSS.
                                            </div>
                                        ) : (
                                            <div className="pattern-editor">
                                                <MockupEditor
                                                    mode="css"
                                                    preview={patternCssList[patternIndex] || ""}
                                                    setPreview={(css) => {
                                                        const newCss = css ?? "";
                                                        setPatternCssList((prev) => {
                                                            const newState = [...prev];
                                                            newState[patternIndex] = newCss;
                                                            return newState;
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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

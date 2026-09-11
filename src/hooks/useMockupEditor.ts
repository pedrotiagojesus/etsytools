import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import { useToast } from "@hooks/useToast";

// Utils
import downloadPng from "@utils/downloadFiles";
import { buildProductConfig, buildSlideConfig, downloadMockupConfig, readMockupConfigFile } from "@utils/mockupConfig";

interface Pattern {
    name: string;
    css: string;
}

export interface Slide {
    id: string;
    name: string;
    mockupTemplateSelected: string;
    previewHtml: string;
    previewCss: string;
    patternsInput: { name: string }[];
    activePatterns: string[];
    patternCssList: string[];
}

export interface LibraryImage {
    id: string;
    name: string;
    dataUrl: string;
}

const DEFAULT_TEMPLATE = "01-before-after";

const generateId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const createEmptySlide = (name: string, template: string): Slide => ({
    id: generateId(),
    name,
    mockupTemplateSelected: template,
    previewHtml: "",
    previewCss: "",
    patternsInput: [],
    activePatterns: [],
    patternCssList: [],
});

export const useMockupEditor = () => {
    const [slides, setSlides] = useState<Slide[]>(() => [createEmptySlide("Slide 1", DEFAULT_TEMPLATE)]);
    const [activeSlideId, setActiveSlideId] = useState<string>(() => slides[0].id);

    const [mockupTemplate, setMockupTemplate] = useState<string[]>([]);
    const [images, setImages] = useState<{ name: string; bg: string | null }[]>([]);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
    const [imageLibrary, setImageLibrary] = useState<LibraryImage[]>([]);

    const importInputRef = useRef<HTMLInputElement>(null);
    const patternsLoadRequested = useRef(false);

    const { showError, showSuccess } = useToast();

    const activeSlide = slides.find((s) => s.id === activeSlideId) ?? slides[0];

    const updateActiveSlide = useCallback(
        (patch: Partial<Slide>) => {
            setSlides((prev) => prev.map((s) => (s.id === activeSlideId ? { ...s, ...patch } : s)));
        },
        [activeSlideId],
    );

    /**
     * Lê o HTML/CSS de um template dos ficheiros em src/templates/mockups —
     * pura, sem efeitos secundários, para ser reutilizável tanto no arranque
     * como ao adicionar um slide ou trocar o template do slide ativo.
     */
    const loadTemplateContent = useCallback(async (template: string): Promise<{ html: string; css: string }> => {
        const mockupTemplateFiles = import.meta.glob("/src/templates/mockups/*/*", { as: "raw" });
        let html = "";
        let css = "";

        for (const path in mockupTemplateFiles) {
            if (!path.includes(`/src/templates/mockups/${template}/`)) continue;

            const loader = mockupTemplateFiles[path];
            const content = await loader();
            const extension = path.split("/")?.pop()?.split(".").pop() || "unknown";

            if (extension === "html" && !html) html = content;
            if (extension === "css" && !css) css = content;
            if (html && css) break;
        }

        return { html, css };
    }, []);

    /**
     * Aplica um template ao slide ativo — usado quando o utilizador escolhe
     * um template diferente no dropdown (reset destrutivo, como sempre foi).
     * Chamado sempre de forma explícita (nunca por um efeito reativo): assim
     * trocar de slide ativo nunca dispara isto por acidente, o que apagaria
     * as edições desse slide sempre que se voltasse a ele.
     */
    const applyTemplateToActiveSlide = useCallback(
        async (template: string) => {
            const slideId = activeSlideId;
            setLoadingTemplate(true);

            try {
                const { html, css } = await loadTemplateContent(template);
                setSlides((prev) =>
                    prev.map((s) =>
                        s.id === slideId
                            ? {
                                  ...s,
                                  mockupTemplateSelected: template,
                                  previewHtml: html,
                                  previewCss: css,
                                  activePatterns: [],
                                  patternCssList: [],
                              }
                            : s,
                    ),
                );
            } catch (err) {
                console.error(`Erro ao carregar o template "${template}":`, err);
                setSlides((prev) =>
                    prev.map((s) =>
                        s.id === slideId
                            ? {
                                  ...s,
                                  mockupTemplateSelected: template,
                                  previewHtml: "<p>Erro ao carregar HTML do mockup.</p>",
                                  previewCss: "body { background: red; }",
                              }
                            : s,
                    ),
                );
                showError(`Erro ao carregar o template "${template}"`);
            } finally {
                setLoadingTemplate(false);
            }
        },
        [activeSlideId, loadTemplateContent, showError],
    );

    // Carrega o template do primeiro slide ao arrancar a página.
    useEffect(() => {
        applyTemplateToActiveSlide(DEFAULT_TEMPLATE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const files = import.meta.glob("/src/templates/mockups/*/*");
                const folders = new Set<string>();

                Object.keys(files).forEach((path) => {
                    const parts = path.split("/");
                    const folder = parts[parts.length - 2];
                    folders.add(folder);
                });

                setMockupTemplate(Array.from(folders).sort());
            } catch (err) {
                console.error("Erro ao carregar template:", err);
                showError("Erro ao carregar templates e padrões");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Carrega o catálogo de ~200 padrões CSS. Chamado só quando a tab
     * "Padrões" é aberta (ver MockupPatterns), não no mount da página —
     * a maioria das visitas ao Mockup nunca chega a abrir essa tab.
     * Idempotente: chamadas repetidas depois da primeira não fazem nada.
     */
    const loadPatterns = useCallback(async () => {
        if (patternsLoadRequested.current) return;
        patternsLoadRequested.current = true;

        try {
            const cssFiles = import.meta.glob("/src/templates/patterns/*.css", { as: "raw" });

            const loaded = await Promise.all(
                Object.entries(cssFiles).map(async ([path, loader]) => ({
                    name: path.split("/").pop()?.replace(".css", "") || "unknown",
                    css: await loader(),
                })),
            );

            const loadedPatterns: Pattern[] = [];
            const loadedPatternNames = new Set<string>();

            for (const { name, css: cssContent } of loaded) {
                if (loadedPatternNames.has(name)) continue;

                if (!document.querySelector(`link[data-pattern="${name}"]`)) {
                    const blob = new Blob([cssContent], {
                        type: "text/css",
                    });
                    const href = URL.createObjectURL(blob);

                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = href;
                    link.setAttribute("data-pattern", name);
                    document.head.appendChild(link);
                }

                loadedPatterns.push({ name, css: cssContent });
                loadedPatternNames.add(name);
            }

            setPatterns(loadedPatterns);
        } catch (err) {
            console.error("Erro ao carregar padrões:", err);
            showError("Erro ao carregar padrões");
            patternsLoadRequested.current = false; // permite tentar de novo
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- Gestão de slides ----------

    const selectSlide = useCallback((id: string) => {
        setActiveSlideId(id);
    }, []);

    const addSlide = useCallback(
        async (template?: string, name?: string) => {
            const chosenTemplate = template ?? mockupTemplate[0] ?? DEFAULT_TEMPLATE;
            const slideName = name?.trim() || `Slide ${slides.length + 1}`;

            setLoadingTemplate(true);
            try {
                const { html, css } = await loadTemplateContent(chosenTemplate);
                const newSlide: Slide = {
                    ...createEmptySlide(slideName, chosenTemplate),
                    previewHtml: html,
                    previewCss: css,
                };
                setSlides((prev) => [...prev, newSlide]);
                setActiveSlideId(newSlide.id);
            } catch (err) {
                console.error(`Erro ao carregar o template "${chosenTemplate}" para o novo slide:`, err);
                showError(`Erro ao criar o slide a partir do template "${chosenTemplate}".`);
            } finally {
                setLoadingTemplate(false);
            }
        },
        [mockupTemplate, slides.length, loadTemplateContent, showError],
    );

    const removeSlide = useCallback(
        (id: string) => {
            setSlides((prev) => {
                if (prev.length <= 1) {
                    showError("Tem de existir pelo menos um slide.");
                    return prev;
                }

                const removedIndex = prev.findIndex((s) => s.id === id);
                const next = prev.filter((s) => s.id !== id);

                if (id === activeSlideId && removedIndex !== -1) {
                    const fallback = next[Math.max(0, removedIndex - 1)] ?? next[0];
                    setActiveSlideId(fallback.id);
                }

                return next;
            });
        },
        [activeSlideId, showError],
    );

    const duplicateSlide = useCallback((id: string) => {
        setSlides((prev) => {
            const index = prev.findIndex((s) => s.id === id);
            if (index === -1) return prev;

            const copy: Slide = { ...prev[index], id: generateId(), name: `${prev[index].name} (cópia)` };
            setActiveSlideId(copy.id);

            return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
        });
    }, []);

    const renameSlide = useCallback((id: string, name: string) => {
        setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    }, []);

    const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
        setSlides((prev) => arrayMove(prev, fromIndex, toIndex));
    }, []);

    const addToLibrary = useCallback((name: string, dataUrl: string) => {
        setImageLibrary((prev) => {
            if (prev.some((img) => img.name === name)) return prev;
            return [...prev, { id: generateId(), name, dataUrl }];
        });
    }, []);

    // ---------- Ações do slide ativo (mantêm a mesma assinatura de sempre) ----------

    const setPatternsInput = useCallback(
        (value: { name: string }[]) => updateActiveSlide({ patternsInput: value }),
        [updateActiveSlide],
    );

    const setActivePatterns = useCallback(
        (update: React.SetStateAction<string[]>) => {
            setSlides((prev) =>
                prev.map((s) => {
                    if (s.id !== activeSlideId) return s;
                    const next = typeof update === "function" ? (update as (prev: string[]) => string[])(s.activePatterns) : update;
                    return { ...s, activePatterns: next };
                }),
            );
        },
        [activeSlideId],
    );

    const setPatternCssList = useCallback(
        (update: React.SetStateAction<string[]>) => {
            setSlides((prev) =>
                prev.map((s) => {
                    if (s.id !== activeSlideId) return s;
                    const next = typeof update === "function" ? (update as (prev: string[]) => string[])(s.patternCssList) : update;
                    return { ...s, patternCssList: next };
                }),
            );
        },
        [activeSlideId],
    );

    const downloadPreview = async () => {
        try {
            await downloadPng("preview-display", activeSlide.name || "mockup", "jpeg");
        } catch (err) {
            console.error(err);
            showError("Erro ao descarregar a pré-visualização.");
        }
    };

    const exportConfig = () => {
        try {
            const slideConfigs = slides.map((s) =>
                buildSlideConfig(s.name, s.mockupTemplateSelected, s.previewHtml, s.previewCss, s.activePatterns, s.patternCssList),
            );
            const config = buildProductConfig(slideConfigs);
            downloadMockupConfig(config, "produto-etsy");
            showSuccess("Configuração exportada com sucesso!");
        } catch (err) {
            console.error(err);
            showError("Erro ao exportar a configuração.");
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const importConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        try {
            const config = await readMockupConfigFile(file);

            const importedSlides: Slide[] = config.slides.map((sc) => ({
                id: generateId(),
                name: sc.name,
                mockupTemplateSelected: sc.template,
                previewHtml: sc.previewHtml,
                previewCss: sc.previewCss,
                patternsInput: [], // derivado automaticamente do HTML assim que o slide fica ativo
                activePatterns: sc.activePatterns,
                patternCssList: sc.activePatterns.map((_, i) => sc.patternStyles[`pattern-style-${i}`] ?? ""),
            }));

            setSlides(importedSlides);
            setActiveSlideId(importedSlides[0].id);

            showSuccess("Configuração importada com sucesso!");
        } catch (err) {
            console.error(err);
            showError(err instanceof Error ? err.message : "Erro ao importar a configuração.");
        }
    };

    const updateHtml = (html: string) => {
        updateActiveSlide({ previewHtml: html });
    };

    const updateCss = (css: string) => {
        updateActiveSlide({ previewCss: css });
    };

    return {
        // slide ativo (mesmos nomes/formas de sempre, para os consumidores existentes)
        mockupTemplateSelected: activeSlide.mockupTemplateSelected,
        setMockupTemplateSelected: applyTemplateToActiveSlide,
        images,
        setImages,
        patternsInput: activeSlide.patternsInput,
        setPatternsInput,
        importInputRef,
        loadingTemplate,
        previewHtml: activeSlide.previewHtml,
        previewCss: activeSlide.previewCss,
        patterns,
        loadPatterns,
        activePatterns: activeSlide.activePatterns,
        setActivePatterns,
        patternCssList: activeSlide.patternCssList,
        setPatternCssList,
        currentEditingIndex,
        setCurrentEditingIndex,
        handleImportClick,

        // catálogo de templates disponíveis (partilhado por todos os slides)
        mockupTemplate,

        // ações semânticas
        updateHtml,
        updateCss,

        // ações de config
        exportConfig,
        downloadPreview,
        importConfig,

        // gestão de slides (aba "Ficha do Produto")
        slides,
        activeSlideId,
        selectSlide,
        addSlide,
        removeSlide,
        duplicateSlide,
        renameSlide,
        reorderSlides,

        // biblioteca de imagens partilhada entre slides
        imageLibrary,
        addToLibrary,
    };
};

export type MockupEditorState = ReturnType<typeof useMockupEditor>;

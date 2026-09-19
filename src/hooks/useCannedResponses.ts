import { useEffect, useState } from "react";
import { createDefaultResponses, type CannedResponse } from "@utils/cannedResponses";

const STORAGE_KEY = "etsytools-canned-responses";

const generateId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const loadFromStorage = (): CannedResponse[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return createDefaultResponses();

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultResponses();

        return parsed;
    } catch {
        return createDefaultResponses();
    }
};

export function useCannedResponses() {
    const [responses, setResponses] = useState<CannedResponse[]>(loadFromStorage);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
        } catch {
            // modo privado ou quota excedida — as respostas continuam a
            // funcionar nesta sessão, só não persistem entre sessões.
        }
    }, [responses]);

    const addResponse = () => {
        setResponses((prev) => [...prev, { id: generateId(), question: "", answer: "" }]);
    };

    const updateResponse = (id: string, patch: Partial<CannedResponse>) => {
        setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const removeResponse = (id: string) => {
        setResponses((prev) => prev.filter((r) => r.id !== id));
    };

    const resetToDefaults = () => {
        setResponses(createDefaultResponses());
    };

    return { responses, addResponse, updateResponse, removeResponse, resetToDefaults };
}

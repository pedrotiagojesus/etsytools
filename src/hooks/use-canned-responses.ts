import { useState } from "react";
import { createDefaultResponses } from "@utils/canned-responses";
import type { CannedResponse } from "@utils/canned-responses";

interface UseCannedResponsesResult {
    responses: CannedResponse[];
    addResponse: () => void;
    updateResponse: (id: string, patch: Partial<CannedResponse>) => void;
    removeResponse: (id: string) => void;
    resetToDefaults: () => void;
}

/**
 * Canned buyer responses, kept in memory only (nothing is saved in the
 * browser): edits last until the page is reloaded. Permanent changes go in
 * the defaults, in src/utils/canned-responses.ts.
 */
export const useCannedResponses = (): UseCannedResponsesResult => {
    const [responses, setResponses] = useState<CannedResponse[]>(createDefaultResponses);

    const addResponse = () => {
        setResponses((prev) => [...prev, { id: crypto.randomUUID(), question: "", answer: "" }]);
    };

    const updateResponse = (id: string, patch: Partial<CannedResponse>) => {
        setResponses((prev) => prev.map((response) => (response.id === id ? { ...response, ...patch } : response)));
    };

    const removeResponse = (id: string) => {
        setResponses((prev) => prev.filter((response) => response.id !== id));
    };

    const resetToDefaults = () => setResponses(createDefaultResponses());

    return { responses, addResponse, updateResponse, removeResponse, resetToDefaults };
};

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Sem `test.globals: true` no vite.config.ts (mantém os imports explícitos
// nos testes), por isso a auto-limpeza do Testing Library não se regista
// sozinha — faz-se aqui.
afterEach(() => {
    cleanup();
});

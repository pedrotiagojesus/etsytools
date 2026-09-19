# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A React/Vite/TypeScript frontend for preparing coloring-book PDF products for Etsy. It talks to a sibling backend (`studio-base-api`, a separate repository — not part of this codebase) over a plain `fetch` API configured via `VITE_API_URL`.

Three independent pages, each a fairly self-contained feature area:
- **Calculator** (`/`, `/calculator`) — Etsy fee/profit-margin calculator.
- **GenerateProduct** (`/generate-product`) — upload page images, kick off the backend's async PDF-generation job, and a cluster of client-side QA/SEO helper panels around that.
- **Mockup** (`/mockup`) — a multi-slide editor for the product's listing images (cover, examples, info graphics), built entirely client-side.

## Commands

```bash
npm run dev              # Vite dev server (falls back to 5174/5175/... if 5173 is taken)
npm run build             # tsc -b && vite build
npm run type-check        # tsc -b --noEmit
npm run lint               # eslint .
npm test                   # vitest run
npm run test:watch         # vitest (watch mode)
npx vitest run src/utils/etsySeo.test.ts   # run a single test file
npx vitest run -t "partial test name"      # run tests matching a name
```

No test runs with `--watch` by default from `npm test`; use `npm run test:watch` for that. There is no `.env` committed — copy `.env.example` to `.env` (`VITE_API_URL`, `VITE_IMGTOOLS_API_KEY`, `VITE_ENV`) before running `dev` against a real backend.

## Architecture

### Path aliases

`@`, `@components`, `@pages`, `@utils`, `@hooks`, `@contexts`, `@assets`, `@templates` all map to `src/*`. They're defined in **three places that must stay in sync**: `vite.config.ts` (`resolve.alias`), `tsconfig.app.json` (`compilerOptions.paths`), and implicitly relied on by `import.meta.glob` calls that use literal `/src/...` paths (those can't use the aliases — see below).

### Routing and code-splitting (`src/main.tsx`)

Each page is `React.lazy`-loaded into its own chunk. This matters because Mockup alone pulls in `react-ace`, `@dnd-kit/*`, and `html-to-image` — none of which the other two pages need. Keep new heavy per-page dependencies inside that page's lazy chunk rather than importing them from a shared module that all pages load.

### GenerateProduct: async job flow + a cluster of client-side helper panels

The backend's `/imgtools/generate-product` endpoint is **async, not request/response**: `POST` returns `202 { jobId }` immediately, `GET .../:jobId/status` is polled every 2s, and `GET .../:jobId/download` streams the result once `status === "completed"`. This whole flow — building the `FormData`, polling, downloading the blob — lives in `src/utils/generateProductJob.ts` (`runGenerateProductJob`), extracted out of the page component specifically so both the single "Gerar Produto" submit and the batch queue (below) can reuse it without duplicating the polling loop.

`GenerateProduct.tsx` also has a **batch queue**: "Adicionar à fila" snapshots the current form (images/title/description) into a `QueueItem` and clears the form for the next product; "Processar fila" then runs `runGenerateProductJob` over the waiting items **sequentially** (not in parallel — the backend's `jobQueue` is a single-process, one-job-at-a-time singleton, so parallel submission would just queue up server-side anyway, with none of the client-side progress clarity).

Several small panels under `src/components/GenerateProduct/` all key off the same `images`/`title` state from the page and are otherwise independent of each other and of the submit flow — they're purely client-side QA/SEO helpers, not part of what gets sent to the backend:
- `PrintPreviewGrid` — renders each uploaded image inside a simulated A4 page (margins/border/contain-fit numbers in `src/utils/pdfPagePreview.ts` are copied from the *backend's* `src/config/pdf.ts` constants, so keep them in sync if that ever changes) and flags images that'll leave a lot of blank space. It also owns the checkbox selection (`selectedFiles: Set<File>`, keyed by `File` identity rather than index — removing an image would otherwise silently desync an index-based selection) that `WatermarkSamplesPanel` reads.
- `DuplicateWarnings` — client-side perceptual-hash (dHash, `src/utils/imageHash.ts`) near-duplicate detection across the uploaded images, no network involved.
- `WatermarkSamplesPanel` — draws a repeated diagonal watermark onto 2-4 selected pages via `<canvas>` and zips them (`src/utils/watermarkSamples.ts`).
- `EtsySeoPanel` — rule-based (no AI, no network) title/tags/description generator (`src/utils/etsySeo.ts`, `src/utils/listingDescription.ts`). Deliberately generates **English** text regardless of the app's Portuguese UI, since that's the language Etsy listings actually sell in — don't "fix" this to match the UI language.

### Mockup: multi-slide editor

`useMockupEditor` (`src/hooks/useMockupEditor.ts`) is the whole feature's state. A product's listing images are modeled as `Slide[]` (cover, examples, info graphic, ...), each with its own `previewHtml`/`previewCss`/pattern state; most of the hook's returned API intentionally still looks like it's operating on a single mockup (`previewHtml`, `updateHtml`, `activePatterns`, ...) — those are thin getters/setters over `slides.find(s => s.id === activeSlideId)`, kept that way so the existing consumer components didn't need to change shape when slides were introduced.

Templates live in `src/templates/mockups/<name>/{example.html,example.css}` and pattern backgrounds in `src/templates/patterns/*.css` (~190 files). Both are loaded at runtime via `import.meta.glob("/src/templates/...", { as: "raw" })` with **literal string paths** (Vite requires the glob argument to be statically analyzable, so these can't use the `@templates` alias or a variable). `loadTemplateContent` is a pure loader (no state), called explicitly from `applyTemplateToActiveSlide`/`addSlide` — never from a reactive `useEffect` keyed on the active slide, because that would wipe a slide's edits every time you switched back to it. The pattern catalog (`loadPatterns`) is loaded lazily, only when the "Padrões" tab is first opened, not on page mount.

`MockupPreview.tsx` renders a slide's `previewHtml` via `dangerouslySetInnerHTML` and injects `previewCss` into a `<style id="mockup-style-{previewDisplayId}">` tag scoped by a per-instance id — the pattern-selection modal and the main editor both render a live preview simultaneously, so they each need their own style tag or one's CSS would stomp the other's. Any new component that needs to render a slide's raw HTML/CSS (e.g. `EtsyThumbnailPreview.tsx`) follows the same id-scoping convention.

Exporting rendered slides to actual image files (`src/utils/exportSlidesAsZip.ts`, `exportSocialFormatsZip.ts`) renders each slide into an **offscreen** container (`position: fixed; top: 0; left: 0; z-index: -1` — not pushed far off-screen with a large negative offset, which makes `html-to-image` rasterize blank) and captures it with `html-to-image`'s `toJpeg`. `captureSlideAsDataUrl` is the shared single-slide capture step; the social-formats export reuses it and then re-crops the result to Pinterest/Instagram aspect ratios via canvas (`src/utils/socialFormats.ts`) rather than re-rendering the slide.

`MockupEditor.tsx` (the Ace code editor wrapping HTML/CSS) debounces `onChange`, and closes over the `onChange` **captured at the moment the user typed**, not a ref that always points at the latest one — otherwise switching the active slide within the debounce window would apply the edit to the newly-active slide instead of the one being edited. `Mockup.tsx` additionally remounts each editor with `key={`html-${activeSlideId}`}` / `key={`css-${activeSlideId}`}` so per-slide local state can't leak across slides at all. Don't "simplify" either of these away.

### Cross-cutting conventions

- **Context/hook split**: providers (`ThemeContext.tsx`, `ToastContext.tsx`) and the consuming hooks (`useTheme.ts`, `useToast.ts`) live in separate files so Vite's Fast Refresh doesn't invalidate the whole tree on every edit to either half.
- **Design tokens**: `src/assets/css/variables.css` defines the CSS custom properties (`--spacing-*`, `--font-size-*`, `--radius-*`, `--border`, `--surface`, `--text-secondary`, `--primary`/`--success`/`--warning`/`--danger`, etc., with dark-mode overrides) used throughout — prefer these over hardcoded colors/spacing in new component CSS.
- **File-object identity as state key**: several features (duplicate detection, watermark-sample selection, the batch queue) key their state off `File` object references rather than array indices, because `ImageUploader` mutates the images array on add/remove/reorder and an index would silently point at the wrong file afterward.
- **Testing**: Vitest + Testing Library, `jsdom` environment, no `test.globals` (tests import `describe`/`it`/`expect` explicitly; `src/test/setup.ts` registers `afterEach(cleanup)` since the auto-cleanup that comes with `globals: true` isn't active). Pure logic (`src/utils/*.ts`) generally has a co-located `*.test.ts`. Canvas/DOM-capture-heavy code (`html-to-image` exports, watermarking, perceptual hashing, the Mockup preview measurement) is deliberately left without unit tests — `jsdom` doesn't render real pixels — and is instead verified manually (e.g. with Playwright) when changed.

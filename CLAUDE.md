# CLAUDE.md

Etsy Tools: a private React + TypeScript + Vite tool for an Etsy shop selling digital colouring books. Black-and-white images (from Midjourney) are uploaded, processed by the API into a print-ready PDF + A4 page images, and those pages are used to build the listing mockups.
Segue as convenções partilhadas em @conventions/CONVENTIONS.md

## Commands

- `npm run dev`: start the dev server
- `npm run build`: type-check and build
- `npm run type-check`: type-check only
- `npm run lint`: ESLint
- `npm test`: Vitest (jsdom); `npm run test:watch`; one file: `npx vitest run src/utils/image-hash.test.ts`
- Pure logic in `src/utils/*.ts` gets a co-located `*.test.ts`. Tests import `describe`/`it`/`expect` explicitly (no globals; `src/test/setup.ts` registers the Testing Library cleanup). Canvas/capture-heavy code (exports, watermark, hashing, video) has no unit tests: jsdom renders no pixels, so check it in the browser.

## Structure

- `src/main.tsx`: router (`/calculator`, `/product`, `/responses`; the old `/generate-product` and `/mockup` redirect to `/product`) and providers. Each page is a `lazy` route in its own chunk; keep heavy page-only dependencies out of shared modules
- `src/pages/Responses/`: canned buyer responses (in memory only; defaults in `src/utils/canned-responses.ts`)
- `src/pages/Product/`: the whole product flow in 4 steps: upload (vectorization threshold preview, PDF cover/terms) → API processing (progress, ZIP, page images, Etsy size limits) → mockup slides (auto slides, export all as a ZIP, MP4 video recorded in the browser) → listing text
- `src/components/Product/`: the upload and processing steps; `src/components/Mockup/`: the slide list and the slide editor (`MockupWorkspace`, rendered with `key={slide.id}`)
- `src/pages/`: one folder per page (`Page.tsx` + `Page.css`)
- `src/components/`: reusable components, each in its own folder with its own `.css`
- `src/contexts/` and `src/hooks/`: theme and toast state
- `src/templates/mockups/`: one folder per mockup template, named `NN-kebab-name` (e.g. `04-new-york`), each with `template.html` + `template.css`. `18`–`26` are matching style families `<style>-<role>` (`ocean`, `cozy`, `night` × `cover`, `examples`, `info`) so a listing looks like one set: a new family provides all three roles with the same palette and fonts, and `*-cover` keeps its key content in the central 75% (Etsy's mobile search crops the first photo to 1:1)
- `src/templates/patterns/`: CSS background patterns
- `src/assets/`: global CSS (theme, variables) and local fonts
- `src/utils/mockup-slides.ts`: slide model, template/pattern loading; pattern CSS is scoped by index (`.pattern-N`), so only the visible slide's pattern styles are in the page
- `src/utils/mockup-config.ts`: slides JSON export/import (version 2; version 1 files become one slide)
- `src/templates/listing/`: user-editable templates for the Etsy listing text (`title.txt`, `tags.txt`, `description.txt`, placeholders `{titulo}`, `{paginas}`, `{descricao}`, `{tema}`) and the default PDF terms page (`terms.txt`)
- `src/utils/etsy-limits.ts`: Etsy limits used across the app (file size, title/tags, video length)
- `src/utils/paper-sizes.ts` and `src/utils/pdf-page-preview.ts` mirror the backend's `PAPER_SIZES`, margin and border (`studio-base-api/src/modules/imgtools/config/pdf.ts`); keep them in sync
- No Claude/LLM API and no browser persistence: generated text comes from the templates; state is in memory, saved only via explicit downloads

## Backend

- The API lives in `../studio-base-api` (`/home/pedro-jesus/Documents/programacao/studio-base-api`), on port 4001.
- The endpoints this app uses are in `src/modules/imgtools/` there (e.g. `controllers/etsytools.controller.ts`, `imgtools.routes.ts`).
- `/imgtools/generate-product` is an async job: POST → `jobId`, poll `/:jobId/status`, then `/:jobId/download` (ZIP) and `/:jobId/pages/:page` (PNG, 2480×3508). Jobs expire after 2 h.
- All calls go through `src/utils/imgtools-api.ts` (`VITE_API_URL` + `VITE_IMGTOOLS_API_KEY`, see `.env.example`).

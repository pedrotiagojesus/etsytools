# CLAUDE.md

Etsy Tools: a private React + TypeScript + Vite tool for an Etsy shop selling digital colouring books. Black-and-white images (from Midjourney) are uploaded, processed by the API into a print-ready PDF + A4 page images, and those pages are used to build the listing mockups.
Segue as convenções partilhadas em @conventions/CONVENTIONS.md

## Commands

- `npm run dev`: start the dev server
- `npm run build`: type-check and build
- `npm run type-check`: type-check only
- `npm run lint`: ESLint

## Structure

- `src/main.tsx`: router (`/calculator`, `/product`; the old `/generate-product` and `/mockup` redirect to `/product`) and providers
- `src/pages/Product/`: the whole product flow in 3 steps: upload → API processing (progress, ZIP, page images) → mockup slides (export all as a ZIP)
- `src/components/Product/`: the upload and processing steps; `src/components/Mockup/`: the slide list and the slide editor (`MockupWorkspace`, rendered with `key={slide.id}`)
- `src/pages/`: one folder per page (`Page.tsx` + `Page.css`)
- `src/components/`: reusable components, each in its own folder with its own `.css`
- `src/contexts/` and `src/hooks/`: theme and toast state
- `src/templates/mockups/`: one folder per mockup template, named `NN-kebab-name` (e.g. `04-new-york`), each with `template.html` + `template.css`
- `src/templates/patterns/`: CSS background patterns
- `src/assets/`: global CSS (theme, variables) and local fonts
- `src/utils/mockup-slides.ts`: slide model, template/pattern loading; pattern CSS is scoped by index (`.pattern-N`), so only the visible slide's pattern styles are in the page
- `src/utils/mockup-config.ts`: slides JSON export/import (version 2; version 1 files become one slide)

## Backend

- The API lives in `../studio-base-api` (`/home/pedro-jesus/Documents/programacao/studio-base-api`), on port 4001.
- The endpoints this app uses are in `src/modules/imgtools/` there (e.g. `controllers/etsytools.controller.ts`, `imgtools.routes.ts`).
- `/imgtools/generate-product` is an async job: POST → `jobId`, poll `/:jobId/status`, then `/:jobId/download` (ZIP) and `/:jobId/pages/:page` (PNG, 2480×3508). Jobs expire after 2 h.
- All calls go through `src/utils/imgtools-api.ts` (`VITE_API_URL` + `VITE_IMGTOOLS_API_KEY`, see `.env.example`).

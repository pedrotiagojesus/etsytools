# CLAUDE.md

Etsy Tools: a React + TypeScript + Vite frontend with tools for an Etsy shop (price calculator, product generator, mockup editor).
Segue as convenções partilhadas em @conventions/CONVENTIONS.md

## Commands

- `npm run dev`: start the dev server
- `npm run build`: type-check and build
- `npm run type-check`: type-check only
- `npm run lint`: ESLint

## Structure

- `src/main.tsx`: router (`/calculator`, `/generate-product`, `/mockup`) and providers
- `src/pages/`: one folder per page (`Page.tsx` + `Page.css`)
- `src/components/`: reusable components, each in its own folder with its own `.css`
- `src/contexts/` and `src/hooks/`: theme and toast state
- `src/templates/mockups/`: one folder per mockup template, named `NN-kebab-name` (e.g. `04-new-york`), each with `template.html` + `template.css`
- `src/templates/patterns/`: CSS background patterns
- `src/assets/`: global CSS (theme, variables) and local fonts

## Backend

- The API lives in `../studio-base-api` (`/home/pedro-jesus/Documents/programacao/studio-base-api`), on port 4001.
- The endpoints this app uses are in `src/modules/imgtools/` there (e.g. `controllers/etsytools.controller.ts`, `imgtools.routes.ts`).

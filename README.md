# Etsy Tools

Ferramentas para gerir uma loja Etsy: calculadora de margem de lucro, gerador de produtos e editor de mockups.

Feito com React, TypeScript, Vite e Bootstrap.

## Como correr

```bash
npm install
cp .env.example .env
npm run dev
```

A app abre em http://localhost:5173.

## Configuração

O `.env` só precisa do URL da API:

```
VITE_API_URL=http://localhost:4001/api
```

A API está no projeto [`studio-base-api`](../studio-base-api), que tem de estar a correr para a página "Gerar Produto" funcionar.

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: verifica os tipos e gera a build em `dist/`
- `npm run typecheck`: só verifica os tipos
- `npm run lint`: ESLint

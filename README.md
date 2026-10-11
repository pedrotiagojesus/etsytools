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

O `.env` precisa do URL da API e da chave do imgtools:

```
VITE_API_URL=http://localhost:4001
VITE_IMGTOOLS_API_KEY=<o mesmo valor de IMGTOOLS_API_KEY no .env do studio-base-api>
```

A chave fica dentro do bundle do frontend. Como a ferramenta é privada e corre localmente, isso não é um problema.

A API está no projeto [`studio-base-api`](../studio-base-api), que tem de estar a correr para a página "Gerar Produto" funcionar.

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: verifica os tipos e gera a build em `dist/`
- `npm run typecheck`: só verifica os tipos
- `npm run lint`: ESLint

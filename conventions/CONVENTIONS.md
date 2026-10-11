# Convenções de código (JavaScript / TypeScript)

Aplicam-se a todos os projetos (frontends e backend). Em caso de dúvida, segue o padrão já existente no ficheiro que estás a editar.

## Nomes

- Variáveis e funções: `camelCase` (`userName`, `getOrders`)
- Classes, tipos, interfaces e componentes React: `PascalCase` (`UserService`, `OrderDto`, `LoginForm`)
- Constantes globais: `UPPER_SNAKE_CASE` (`MAX_RETRIES`)
- Booleanos começam por `is`, `has`, `can` ou `should` (`isLoading`, `hasAccess`)
- Ficheiros: `kebab-case.ts`; componentes React em `PascalCase.tsx`
- Sem prefixos em tipos: `User`, não `IUser` nem `TUser`
- Nomes descritivos; evitar abreviaturas (`customer`, não `cst`)

## Escrita de código

- `const` por defeito, `let` só quando há reatribuição, nunca `var`
- Usar sempre `===` e `!==`
- Funções pequenas, com uma só responsabilidade
- Preferir retornos antecipados a `if` aninhados
- `async/await` em vez de cadeias de `.then()`
- Usar `?.` e `??` em vez de verificações manuais de `null`/`undefined`
- Não mutar objetos nem arrays recebidos: usar spread, `map`, `filter`
- Sem código comentado nem `console.log` esquecidos em commits
- Comentários explicam o *porquê*, não o *quê*

## TypeScript

- `strict: true` no `tsconfig.json`; não desativar regras para contornar erros
- Proibido `any`; usar `unknown` e estreitar o tipo com verificações
- Tipificar explicitamente parâmetros e retornos de funções exportadas; deixar inferir o resto
- Union types em vez de `enum` para conjuntos de valores simples:
  `type Status = "pending" | "paid" | "cancelled";`
- `interface` para formas de objetos; `type` para unions, interseções e utilitários
- Evitar `as` (type assertions) exceto quando inevitável, e nunca `as any`
- Não usar `!` (non-null assertion) para silenciar o compilador

## Erros

- Nunca engolir erros com `catch {}` vazio
- No frontend, mostrar ao utilizador uma mensagem compreensível e registar o detalhe
- No backend, devolver respostas de erro com formato consistente

## Contrato frontend ↔ backend

- O backend é a fonte de verdade para formatos de pedidos e respostas
- Antes de alterar chamadas à API no frontend, verificar no backend o endpoint, os DTOs e as validações
- Os tipos da API devem refletir exatamente os DTOs do backend (nomes de campos, opcionais, nulos)

## Antes de terminar uma tarefa

1. Correr `npm run lint` e corrigir os erros
2. Correr `npm run typecheck` (ou `tsc --noEmit`)
3. Correr os testes relacionados com o código alterado
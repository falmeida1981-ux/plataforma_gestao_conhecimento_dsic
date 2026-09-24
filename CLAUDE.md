# Plataforma de Gestão de Operações DSIC

Diário de operações da DSIC (CMG): intervenções, ocorrências, inventário de dependências, notificações e conhecimento.
Os requisitos estão em [docs/requisitos.md](docs/requisitos.md) (RF01–RF35, RNF01–RNF25) e as decisões de arquitetura em [docs/decisoes/](docs/decisoes/).

@AGENTS.md

## Forma de trabalhar

- Um marco de cada vez (M1–M8, ver "Plano de implementação" nos requisitos). Para cada marco: primeiro um plano, revisto pelo utilizador, e só depois a implementação.
- Conventional Commits com referência ao requisito ou marco: `feat(RF05): acrescentar destinatários manualmente`, `chore(M1): configurar CI`.
- Trabalho em ramos e pull requests; o `main` é protegido.
- Testes obrigatórios para as regras críticas: permissões, cálculo de impacto, imutabilidade, cadeia de hash e fila de envio.

## Comandos

| Comando                                  | O que faz                                                       |
| ---------------------------------------- | --------------------------------------------------------------- |
| `npm run dev:all`                        | App (http://localhost:3000) e worker em modo de desenvolvimento |
| `npm run lint` / `npm run format`        | ESLint / Prettier                                               |
| `npm run typecheck`                      | Gera os tipos das rotas e corre `tsc --noEmit`                  |
| `npm test`                               | Testes unitários (Vitest, `tests/unit`)                         |
| `npm run test:e2e`                       | Testes ponta a ponta (Playwright, `tests/e2e`)                  |
| `npm run db:migrate`                     | Cria e aplica uma migração (`prisma migrate dev`)               |
| `npm run db:seed`                        | Seed com dados fictícios                                        |
| `npm run build` / `npm run build:worker` | Build da app (standalone) e do worker (`dist/worker`)           |

Na rede da CMG (inspeção TLS), definir `NODE_OPTIONS=--use-system-ca` para o Node confiar nos certificados do Windows.

## Convenções do código

- **Nomes do domínio em português, sem acentos**: `Intervencao`, `Ocorrencia`, `Ativo`, `Procedimento`, `registarHeartbeat`. Código técnico genérico pode ficar em inglês. A interface é sempre em português de Portugal.
- **Prisma**: modelos e campos em camelCase, tabelas e colunas em snake_case via `@@map`/`@map`. IDs `Int @id @default(autoincrement())`; datas `@db.DateTime(3)`. O cliente é gerado em `src/generated/prisma` (não versionado) e importado de `@/generated/prisma/client`.
- **Duas ligações à BD**: `DATABASE_URL` (utilizador `dsic_app`, só DML) para a app e o worker; `DATABASE_URL_MIGRACOES` (dono do esquema) só para o CLI do Prisma.
- **Nunca apagar registos** (RNF09): desativar (`ativo`/`desativadoEm`) ou criar nova versão com motivo. Não usar `delete`/`deleteMany` em entidades de negócio.
- **Autorização sempre no servidor** (RNF02): a partir do M2, todas as server actions e route handlers passam pelo wrapper `acao(esquemaZod, permissao, handler)`, que valida a entrada com Zod e verifica a permissão. Nunca confiar só na interface.
- **Validação com Zod**, com o mesmo esquema no formulário e no servidor.
- **Datas**: guardar em UTC; mostrar sempre através de `src/lib/datas.ts` (hora de Lisboa). Não usar `toLocaleString` solto.
- **Configuração**: variáveis de ambiente só através de `env()` em `src/lib/env.ts` (validadas com Zod). Parâmetros de negócio configuráveis ficam na tabela `parametro`.
- **Logs**: `logger` / `criarLogger` de `src/lib/logger.ts` (JSON). Nunca registar segredos, palavras-passe ou tokens.
- **Segredos** nunca no repositório; `.env.example` só com valores de desenvolvimento.
- **Seed** só com dados fictícios: nunca hostnames, IPs ou nomes reais da CMG.
- **Páginas dinâmicas**: a CSP usa um nonce por pedido (`src/proxy.ts`), por isso o layout raiz chama `connection()`. Não introduzir páginas estáticas nem scripts inline sem nonce.
- **Worker** (`worker/`): partilha `src/lib` e o Prisma Client com a app. A fila é uma tabela MySQL (sem Redis).
- **UI**: shadcn/ui (`src/components/ui`, não editar à mão sem necessidade) e componentes da plataforma em `src/components/<area>`. Responsiva e acessível (WCAG 2.1 AA): landmarks, `aria-*`, foco visível.

## Estrutura

```
src/app/(app)/      páginas autenticadas com o shell (barra lateral + cabeçalho)
src/app/api/        route handlers (ex.: /api/health)
src/components/     ui/ (shadcn) e componentes da plataforma
src/lib/            env, db, logger, datas, utilitários partilhados com o worker
src/proxy.ts        CSP com nonce (e sessão, a partir do M2)
worker/             processo de tarefas em segundo plano
prisma/             schema, migrações e seed
deploy/             Dockerfile, docker-compose, Nginx, scripts MySQL
docs/               requisitos e decisões (ADR)
```

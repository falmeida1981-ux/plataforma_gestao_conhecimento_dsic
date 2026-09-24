# Plataforma de Gestão de Operações DSIC

Diário de operações da DSIC: nenhuma intervenção técnica na infraestrutura da CMG acontece sem registo nem aviso a quem é afetado.

- Requisitos: [docs/requisitos.md](docs/requisitos.md)
- Decisões de arquitetura: [docs/decisoes/](docs/decisoes/)
- Convenções para quem desenvolve (incluindo o Claude Code): [CLAUDE.md](CLAUDE.md)

## Stack

Next.js 16 (App Router) · TypeScript estrito · Tailwind CSS 4 + shadcn/ui · MySQL 8.4 + Prisma 7 · worker Node.js · Vitest + Playwright · Docker Compose + Nginx.

## Arranque local

Pré-requisitos: Node 24 LTS (`.nvmrc`) e MySQL 8 local.

1. **Base de dados**: correr uma vez, como root, o script que cria as bases de dados e os utilizadores de desenvolvimento:

   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -P 3307 < scripts\dev\criar-bd-dev.sql
   ```

2. **Configuração**: `cp .env.example .env` e ajustar a porta do MySQL, se necessário.
   Na rede da CMG (inspeção TLS), definir antes `NODE_OPTIONS=--use-system-ca`.

3. **Dependências, migrações e seed**:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

4. **Arrancar** a app e o worker:

   ```bash
   npm run dev:all
   ```

   - Aplicação: http://localhost:3000
   - Health check: http://localhost:3000/api/health

## Verificações

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
npx playwright install chromium   # uma vez
npm run test:e2e
```

## Implantação

Ver [deploy/](deploy/): `Dockerfile` com os alvos `app`, `worker` e `migrate`, `docker-compose.yml` com MySQL 8.4, e a configuração do Nginx com o certificado interno. Os segredos de produção ficam em `deploy/.env` (modelo em `deploy/.env.producao.example`).

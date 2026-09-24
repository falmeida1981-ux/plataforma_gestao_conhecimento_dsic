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

## Implantação (Windows Server 2022)

No servidor (PowerShell como administrador), uma vez:

1. Instalar Node 24 LTS, Git e MySQL 8.4; no IIS, os módulos URL Rewrite e ARR (proxy HTTPS para `http://127.0.0.1:3000`).
2. `git clone https://github.com/falmeida1981-ux/plataforma_gestao_conhecimento_dsic.git` (cria a pasta `plataforma_gestao_conhecimento_dsic`; o nome da pasta não importa para os scripts)
3. Criar a base de dados `dsic_ops` e os utilizadores `dsic_app` e `dsic_migracoes` (adaptar `scripts/dev/criar-bd-dev.sql` com palavras-passe fortes).
4. `copy .env.example .env` e preencher (URLs de produção, `CHAVE_CIFRA`, `BACKUP_PASTA` noutro disco).

Depois, a cada nova versão no GitHub (e também na primeira instalação):

```
deploy\deploy.cmd          (só atualiza se houver versão nova)
deploy\deploy.cmd force    (reinstala mesmo sem alterações)
```

O deploy atualiza do GitHub → instala as dependências → valida o `.env` → compila → corre os testes →
para os serviços → **faz a cópia de segurança** (BD + `.env` + versão anterior, em `BACKUP_PASTA`) →
aplica as migrações → publica em `publicado\` (a versão anterior fica em `publicado-anterior\`) →
inicia os serviços "Operacoes DSIC" e "Operacoes DSIC Worker" → confirma o `/api/health`.
Se algo falhar antes da cópia de segurança, os serviços continuam com a versão anterior.

Cópia de segurança manual: `node scripts\backup-bd.mjs manual`. Remover os serviços: `node deploy\uninstall-service.js`.

A pasta `deploy/` inclui também uma alternativa com Docker Compose + Nginx, para servidores Linux.

# syntax=docker/dockerfile:1
# Imagens da plataforma. Construir a partir da raiz do repositório:
#   docker build -f deploy/Dockerfile --target app     -t dsic-ops-app .
#   docker build -f deploy/Dockerfile --target worker  -t dsic-ops-worker .
#   docker build -f deploy/Dockerfile --target migrate -t dsic-ops-migrate .

FROM node:25-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependências completas (inclui o CLI do Prisma; o postinstall gera o cliente).
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# Build da aplicação Next (standalone) e do worker (bundle esbuild).
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valores fictícios só para o build passar a validação do env; nunca ficam na imagem final.
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" \
    APP_URL="http://localhost:3000" \
    PASTA_ANEXOS="/tmp/anexos" \
    npm run build \
 && npm run build:worker

# Migrações: corre `prisma migrate deploy` com o utilizador dono do esquema.
FROM deps AS migrate
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

# Aplicação web.
FROM base AS app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1
CMD ["node", "server.js"]

# Worker (notificações, lembretes, verificação da auditoria).
FROM base AS worker
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=builder --chown=node:node /app/dist/worker ./dist/worker
USER node
CMD ["node", "dist/worker/index.mjs"]

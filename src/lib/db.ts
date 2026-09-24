import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@/generated/prisma/client";
import { configuracaoPool } from "@/lib/db-config";
import { env } from "@/lib/env";

function criarCliente(): PrismaClient {
  const { DATABASE_URL, DB_LIGACOES_MAX, DB_SSL } = env();
  const adapter = new PrismaMariaDb(
    configuracaoPool(DATABASE_URL, { ligacoesMax: DB_LIGACOES_MAX, ssl: DB_SSL }),
  );
  return new PrismaClient({ adapter });
}

// Em desenvolvimento o hot reload do Next reavalia os módulos; reutilizamos o cliente para não esgotar ligações.
const globalComPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalComPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") {
  globalComPrisma.prisma = db;
}

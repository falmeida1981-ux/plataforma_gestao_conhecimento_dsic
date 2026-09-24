import { connection, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  avaliarWorker,
  compilarRelatorio,
  type EstadoComponente,
  type EstadoWorkerSaude,
} from "@/lib/saude";
import { VERSAO_APP } from "@/lib/versao";

// Health check para a monitorização (RNF17). Público, sem detalhe técnico além da versão.
// Responde 503 só quando a base de dados falha; um worker atrasado dá "degradado" com 200.
export async function GET() {
  await connection();
  const agora = new Date();

  let bd: EstadoComponente = "ok";
  let worker: EstadoWorkerSaude = "desconhecido";

  try {
    await db.$queryRaw`SELECT 1`;
    const maisRecente = await db.estadoWorker.findFirst({ orderBy: { ultimoHeartbeat: "desc" } });
    worker = avaliarWorker(maisRecente?.ultimoHeartbeat ?? null, agora);
  } catch (erro) {
    bd = "erro";
    logger.error({ err: erro }, "health check: base de dados indisponível");
  }

  const relatorio = compilarRelatorio(bd, worker, VERSAO_APP, agora);
  return NextResponse.json(relatorio, {
    status: bd === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

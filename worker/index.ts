import "dotenv/config";

import { setTimeout as esperar } from "node:timers/promises";

import { db } from "@/lib/db";
import { criarLogger } from "@/lib/logger";
import { VERSAO_APP } from "@/lib/versao";

// Worker de tarefas em segundo plano. No M1 só regista o heartbeat;
// a partir do M6 processa a fila de notificações, os lembretes e a verificação da cadeia de auditoria.

const INTERVALO_MS = 30_000;
const NOME_WORKER = process.env.NOME_WORKER ?? "principal";

const log = criarLogger("worker");
const paragem = new AbortController();

async function registarHeartbeat(iniciadoEm: Date) {
  const agora = new Date();
  await db.estadoWorker.upsert({
    where: { nome: NOME_WORKER },
    create: { nome: NOME_WORKER, versao: VERSAO_APP, iniciadoEm, ultimoHeartbeat: agora },
    update: { versao: VERSAO_APP, iniciadoEm, ultimoHeartbeat: agora },
  });
}

async function executar() {
  const iniciadoEm = new Date();
  log.info({ nome: NOME_WORKER, versao: VERSAO_APP }, "worker iniciado");

  while (!paragem.signal.aborted) {
    try {
      await registarHeartbeat(iniciadoEm);
      log.debug("heartbeat registado");
    } catch (erro) {
      log.error({ err: erro }, "falha no ciclo do worker");
    }

    try {
      await esperar(INTERVALO_MS, undefined, { signal: paragem.signal });
    } catch {
      // interrompido pelo sinal de paragem
    }
  }

  await db.$disconnect();
  log.info("worker terminado");
}

for (const sinal of ["SIGINT", "SIGTERM"] as const) {
  process.on(sinal, () => {
    log.info({ sinal }, "pedido de paragem recebido");
    paragem.abort();
  });
}

executar().catch((erro: unknown) => {
  log.fatal({ err: erro }, "worker terminou com erro");
  process.exit(1);
});

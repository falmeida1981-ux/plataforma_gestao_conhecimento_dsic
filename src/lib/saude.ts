export type EstadoComponente = "ok" | "erro";
export type EstadoWorkerSaude = "ok" | "atrasado" | "sem-registo" | "desconhecido";

/** O worker escreve um heartbeat a cada 30 s; acima deste limite consideramo-lo atrasado. */
export const LIMITE_HEARTBEAT_MS = 2 * 60 * 1000;

export function avaliarWorker(
  ultimoHeartbeat: Date | null,
  agora: Date,
  limiteMs = LIMITE_HEARTBEAT_MS,
): EstadoWorkerSaude {
  if (!ultimoHeartbeat) return "sem-registo";
  return agora.getTime() - ultimoHeartbeat.getTime() <= limiteMs ? "ok" : "atrasado";
}

export interface RelatorioSaude {
  estado: "ok" | "degradado" | "erro";
  versao: string;
  bd: EstadoComponente;
  worker: EstadoWorkerSaude;
  hora: string;
}

export function compilarRelatorio(
  bd: EstadoComponente,
  worker: EstadoWorkerSaude,
  versao: string,
  agora: Date,
): RelatorioSaude {
  const estado = bd === "erro" ? "erro" : worker === "ok" ? "ok" : "degradado";
  return { estado, versao, bd, worker, hora: agora.toISOString() };
}

import pino from "pino";

// Logs estruturados em JSON para stdout (RNF17). Nunca registar segredos nem palavras-passe.
export function criarLogger(servico: "app" | "worker") {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: { servico },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ["password", "*.password", "palavraPasse", "*.palavraPasse", "token", "*.token"],
      censor: "[oculto]",
    },
  });
}

export const logger = criarLogger("app");

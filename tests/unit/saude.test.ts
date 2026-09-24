import { describe, expect, it } from "vitest";

import { avaliarWorker, compilarRelatorio, LIMITE_HEARTBEAT_MS } from "@/lib/saude";

const agora = new Date("2026-09-24T12:00:00Z");

describe("avaliarWorker", () => {
  it("sem heartbeat registado", () => {
    expect(avaliarWorker(null, agora)).toBe("sem-registo");
  });

  it("heartbeat recente está ok, incluindo no limite exato", () => {
    expect(avaliarWorker(new Date(agora.getTime() - 30_000), agora)).toBe("ok");
    expect(avaliarWorker(new Date(agora.getTime() - LIMITE_HEARTBEAT_MS), agora)).toBe("ok");
  });

  it("heartbeat acima do limite está atrasado", () => {
    expect(avaliarWorker(new Date(agora.getTime() - LIMITE_HEARTBEAT_MS - 1), agora)).toBe(
      "atrasado",
    );
  });
});

describe("compilarRelatorio", () => {
  it("ok quando base de dados e worker estão ok", () => {
    expect(compilarRelatorio("ok", "ok", "1.0.0", agora)).toEqual({
      estado: "ok",
      versao: "1.0.0",
      bd: "ok",
      worker: "ok",
      hora: "2026-09-24T12:00:00.000Z",
    });
  });

  it("degradado quando só o worker falha", () => {
    expect(compilarRelatorio("ok", "atrasado", "1.0.0", agora).estado).toBe("degradado");
  });

  it("erro quando a base de dados falha", () => {
    expect(compilarRelatorio("erro", "desconhecido", "1.0.0", agora).estado).toBe("erro");
  });
});

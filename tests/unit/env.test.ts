import { describe, expect, it } from "vitest";

import { validarEnv } from "@/lib/env";

const BASE = {
  DATABASE_URL: "mysql://dsic_app:segredo@localhost:3307/dsic_ops_dev",
  APP_URL: "http://localhost:3000",
  PASTA_ANEXOS: "./dados/anexos",
};

describe("validarEnv", () => {
  it("aceita uma configuração mínima e aplica valores por omissão", () => {
    const env = validarEnv(BASE);
    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.DB_LIGACOES_MAX).toBe(10);
    expect(env.DB_SSL).toBe(false);
  });

  it("converte valores numéricos e booleanos", () => {
    const env = validarEnv({ ...BASE, DB_LIGACOES_MAX: "4", DB_SSL: "true" });
    expect(env.DB_LIGACOES_MAX).toBe(4);
    expect(env.DB_SSL).toBe(true);
  });

  it("rejeita um DATABASE_URL que não seja mysql://", () => {
    expect(() => validarEnv({ ...BASE, DATABASE_URL: "postgres://x@localhost/db" })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("lista todas as variáveis em falta", () => {
    expect(() => validarEnv({})).toThrow(/DATABASE_URL[\s\S]*APP_URL[\s\S]*PASTA_ANEXOS/);
  });
});

import { describe, expect, it } from "vitest";

import { configuracaoPool } from "@/lib/db-config";

describe("configuracaoPool", () => {
  it("converte um URL mysql:// na configuração do driver", () => {
    const config = configuracaoPool("mysql://dsic_app:p%40ss%3Aw0rd@db.exemplo:3307/dsic_ops", {
      ligacoesMax: 5,
      ssl: false,
    });
    expect(config).toMatchObject({
      host: "db.exemplo",
      port: 3307,
      user: "dsic_app",
      password: "p@ss:w0rd",
      database: "dsic_ops",
      connectionLimit: 5,
      timezone: "Z",
      allowPublicKeyRetrieval: true,
    });
    expect(config.ssl).toBeUndefined();
  });

  it("usa a porta 3306 por omissão e TLS com verificação quando pedido", () => {
    const config = configuracaoPool("mysql://u:p@db/base", { ligacoesMax: 10, ssl: true });
    expect(config.port).toBe(3306);
    expect(config.ssl).toEqual({ rejectUnauthorized: true });
    expect(config.allowPublicKeyRetrieval).toBeUndefined();
  });

  it("rejeita outros protocolos e URLs sem base de dados", () => {
    expect(() =>
      configuracaoPool("mariadb://u:p@db/base", { ligacoesMax: 1, ssl: false }),
    ).toThrow();
    expect(() => configuracaoPool("mysql://u:p@db/", { ligacoesMax: 1, ssl: false })).toThrow(
      /base de dados/,
    );
  });
});

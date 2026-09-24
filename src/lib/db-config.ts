import type { PoolConfig } from "mariadb";

interface OpcoesPool {
  ligacoesMax: number;
  ssl: boolean;
}

/**
 * Converte um URL mysql:// na configuração do pool do driver mariadb usado pelo Prisma.
 * O driver só aceita URLs mariadb://, e o CLI do Prisma só aceita mysql://.
 */
export function configuracaoPool(url: string, opcoes: OpcoesPool): PoolConfig {
  const u = new URL(url);
  if (u.protocol !== "mysql:") {
    throw new Error("O URL da base de dados tem de começar por mysql://");
  }
  const baseDados = decodeURIComponent(u.pathname.replace(/^\//, ""));
  if (!baseDados) {
    throw new Error("O URL da base de dados não indica a base de dados");
  }

  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: baseDados,
    connectionLimit: opcoes.ligacoesMax,
    // Guardamos e lemos sempre em UTC (RNF19).
    timezone: "Z",
    ...(opcoes.ssl
      ? { ssl: { rejectUnauthorized: true } }
      : // Sem TLS, o caching_sha2_password do MySQL 8 precisa da chave pública do servidor.
        { allowPublicKeyRetrieval: true }),
  };
}

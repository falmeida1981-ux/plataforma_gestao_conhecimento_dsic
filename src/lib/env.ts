import { z } from "zod";

const esquemaEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url({ protocol: /^mysql$/, error: "DATABASE_URL tem de ser um URL mysql://" }),
  DB_LIGACOES_MAX: z.coerce.number().int().positive().default(10),
  DB_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((valor) => valor === "true"),
  // Endereço pelo qual os utilizadores acedem (ex.: http://10.0.0.5:3002). Obrigatório a partir do M6 (links nas notificações).
  APP_URL: z.url().optional(),
  PASTA_ANEXOS: z.string().min(1),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  // Obrigatória a partir do M2 (cifra de segredos em BD, RNF04).
  CHAVE_CIFRA: z.string().optional(),
});

export type Env = z.infer<typeof esquemaEnv>;

/** Valida um conjunto de variáveis de ambiente. Lança um erro com todos os problemas encontrados. */
export function validarEnv(fonte: Record<string, string | undefined>): Env {
  const resultado = esquemaEnv.safeParse(fonte);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((problema) => `  - ${problema.path.join(".")}: ${problema.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas:\n${problemas}`);
  }
  return resultado.data;
}

let envEmCache: Env | undefined;

/** Variáveis de ambiente validadas; a primeira chamada valida process.env. */
export function env(): Env {
  envEmCache ??= validarEnv(process.env);
  return envEmCache;
}

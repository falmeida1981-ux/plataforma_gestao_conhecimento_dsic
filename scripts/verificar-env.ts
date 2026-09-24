// Valida o .env antes de publicar uma versão (usado pelo deploy/deploy.cmd).
import "dotenv/config";

import { validarEnv } from "@/lib/env";

try {
  validarEnv(process.env);
  console.log("Configuração OK");
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
}

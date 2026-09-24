import "dotenv/config";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

// Seed do ambiente de desenvolvimento. Só dados fictícios: nunca hostnames, IPs ou nomes reais da CMG.
// Os parâmetros são valores por omissão provisórios até as questões em aberto de docs/requisitos.md terem resposta.
// O upsert não altera parâmetros que o administrador já tenha mudado.

const PARAMETROS_OMISSAO: { chave: string; valor: Prisma.InputJsonValue; descricao: string }[] = [
  {
    chave: "intervencao.avisoMinimoHoras",
    valor: 24,
    descricao: "Aviso mínimo antes de uma intervenção; abaixo disto só como emergência (RF06)",
  },
  {
    chave: "intervencao.rollbackObrigatorioAPartirDeRisco",
    valor: "MEDIO",
    descricao: "Nível de risco a partir do qual o plano de rollback é obrigatório (RF01)",
  },
  {
    chave: "emergencia.prazoDocumentacaoHoras",
    valor: 24,
    descricao: "Prazo para completar a documentação de uma emergência (RF07)",
  },
  {
    chave: "notificacao.lembreteAntesInicioMinutos",
    valor: 60,
    descricao: "Antecedência do lembrete aos afetados antes do início",
  },
  {
    chave: "confirmacaoReposicao.validadeHoras",
    valor: 72,
    descricao: "Validade dos links de confirmação de reposição (RNF25)",
  },
  {
    chave: "sessao.inatividadeMinutos",
    valor: 30,
    descricao: "Expiração da sessão por inatividade",
  },
  {
    chave: "login.maxTentativas",
    valor: 5,
    descricao: "Tentativas falhadas antes do bloqueio temporário",
  },
  {
    chave: "login.bloqueioMinutos",
    valor: 15,
    descricao: "Duração do bloqueio temporário após falhas de login",
  },
];

async function main() {
  for (const parametro of PARAMETROS_OMISSAO) {
    await db.parametro.upsert({
      where: { chave: parametro.chave },
      create: parametro,
      update: {},
    });
  }
  console.log(`Seed concluído: ${PARAMETROS_OMISSAO.length} parâmetros.`);
}

main()
  .catch((erro: unknown) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

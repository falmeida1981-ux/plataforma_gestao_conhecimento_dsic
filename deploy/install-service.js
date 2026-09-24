// install-service.js
// Cria (ou recria) os serviços Windows da plataforma: aplicação web e worker.
// Correr no SERVIDOR, como administrador, depois de publicar (o deploy.cmd trata disso):
//   node deploy\install-service.js
const fs = require("fs");
const path = require("path");
const s = require("./servico-windows");

(async () => {
  for (const ficheiro of ["publicado/app/server.js", "publicado/worker/index.mjs"]) {
    if (!fs.existsSync(path.join(s.RAIZ, ficheiro))) {
      console.error(`ERRO: falta ${ficheiro}. Corra primeiro o deploy: deploy\\deploy.cmd force`);
      process.exit(1);
    }
  }
  s.exigirAdministrador();

  for (const svc of s.servicos) {
    console.log(`Serviço: ${svc.name} (${s.nomeWindows(svc)})`);
    // Remove primeiro para garantir uma instalação limpa
    if (await s.remover(svc)) console.log("  Instalação anterior removida.");
    await s.instalar(svc);
    console.log("  Registado. A iniciar...");
    const estado = s.iniciar(svc);
    if (estado !== "RUNNING") {
      console.error(
        `\nERRO: o serviço "${svc.name}" ficou no estado ${estado}. Últimas linhas dos logs:`,
      );
      s.mostrarLogs();
      process.exit(1);
    }
  }

  console.log(`Serviços a correr. A confirmar que a aplicação responde na porta ${s.porta()}...`);
  const url = await s.aplicacaoResponde(60);
  if (!url) {
    console.error("\nAVISO: a aplicação não respondeu em 60 segundos. Últimas linhas dos logs:");
    s.mostrarLogs();
    process.exit(1);
  }
  console.log(`\nServiços instalados e a funcionar: ${url}`);
})().catch((erro) => {
  console.error(`\nERRO: ${erro.message}`);
  process.exit(1);
});

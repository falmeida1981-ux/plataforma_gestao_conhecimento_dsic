// uninstall-service.js
// Remove os serviços Windows da plataforma. Correr no SERVIDOR, como administrador:
//   node deploy\uninstall-service.js
const s = require("./servico-windows");

(async () => {
  s.exigirAdministrador();
  for (const svc of s.servicos) {
    const removido = await s.remover(svc);
    console.log(`${svc.name}: ${removido ? "removido com sucesso" : "não estava instalado"}.`);
  }
})().catch((erro) => {
  console.error(`ERRO: ${erro.message}`);
  process.exit(1);
});

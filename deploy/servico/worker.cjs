// Arranque do worker como serviço Windows (registado por deploy/install-service.js).
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const raiz = path.resolve(__dirname, "..", "..");
process.loadEnvFile(path.join(raiz, ".env"));
process.env.NODE_ENV = "production";
process.chdir(raiz);

import(pathToFileURL(path.join(raiz, "publicado", "worker", "index.mjs")).href).catch((erro) => {
  console.error(erro);
  process.exit(1);
});

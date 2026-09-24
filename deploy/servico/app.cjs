// Arranque da aplicação web como serviço Windows (registado por deploy/install-service.js).
// Corre a versão publicada em publicado\app, não a pasta de build, para o build não mexer na versão em uso.
const path = require("node:path");

const raiz = path.resolve(__dirname, "..", "..");
process.loadEnvFile(path.join(raiz, ".env"));
process.env.NODE_ENV = "production";
process.env.PORT ||= "3000";
process.env.HOSTNAME ||= "127.0.0.1"; // só o IIS acede diretamente

const pasta = path.join(raiz, "publicado", "app");
process.chdir(pasta);
require(path.join(pasta, "server.js"));

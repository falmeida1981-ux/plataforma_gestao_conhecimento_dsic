// servico-windows.js
// Funções partilhadas por install-service.js, uninstall-service.js e deploy.cmd
// para gerir os dois serviços Windows da plataforma (app web e worker) com o node-windows.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { parseEnv } = require("util");
const { Service } = require("node-windows");

const RAIZ = path.resolve(__dirname, "..");
const PASTA_LOGS = path.join(__dirname, "servico", "daemon");

const DEFINICOES = [
  {
    name: "Operacoes DSIC",
    description: "Plataforma de Gestão de Operações DSIC - aplicação web",
    script: path.join(__dirname, "servico", "app.cjs"),
  },
  {
    name: "Operacoes DSIC Worker",
    description:
      "Plataforma de Gestão de Operações DSIC - worker (notificações e tarefas agendadas)",
    script: path.join(__dirname, "servico", "worker.cjs"),
  },
];

function lerEnv() {
  const ficheiro = path.join(RAIZ, ".env");
  return fs.existsSync(ficheiro) ? parseEnv(fs.readFileSync(ficheiro, "utf8")) : {};
}

// Node usado pelos serviços: o de NODE_HOME (Node próprio da plataforma) ou, sem ele, o que corre este script.
const NODE_HOME = lerEnv().NODE_HOME;
const EXEC_PATH = NODE_HOME ? path.join(NODE_HOME, "node.exe") : process.execPath;

const servicos = DEFINICOES.map(
  (d) =>
    new Service({
      ...d,
      execPath: EXEC_PATH,
      workingDirectory: RAIZ,
      maxRestarts: 10,
      wait: 2,
      grow: 0.5,
    }),
);

/** Nome do serviço no Windows (o que se usa em "sc query" e "net start"). */
const nomeWindows = (svc) => `${svc.id}.exe`;

function exigirAdministrador() {
  try {
    execSync("net session", { stdio: "ignore" });
  } catch {
    throw new Error("é preciso correr como administrador.");
  }
}

function esperarEvento(svc, evento, acao, segundos = 60) {
  return new Promise((resolve, reject) => {
    const limite = setTimeout(
      () => reject(new Error(`sem resposta do serviço "${svc.name}" (${evento})`)),
      segundos * 1000,
    );
    svc.once(evento, () => {
      clearTimeout(limite);
      resolve();
    });
    svc.once("error", (erro) => {
      clearTimeout(limite);
      reject(erro instanceof Error ? erro : new Error(String(erro)));
    });
    acao();
  });
}

function estado(svc) {
  try {
    const saida = execSync(`sc query "${nomeWindows(svc)}"`).toString();
    return /STATE\s+:\s+\d+\s+(\w+)/.exec(saida)?.[1] ?? "DESCONHECIDO";
  } catch {
    return "NAO_EXISTE";
  }
}

async function remover(svc) {
  if (!svc.exists && estado(svc) === "NAO_EXISTE") return false;
  await esperarEvento(svc, "uninstall", () => svc.uninstall());
  return true;
}

async function instalar(svc) {
  await esperarEvento(svc, "install", () => svc.install());
}

function iniciar(svc, segundos = 30) {
  try {
    execSync(`net start "${nomeWindows(svc)}"`, { stdio: "ignore" });
  } catch {
    // pode já estar a arrancar; confirma-se abaixo
  }
  for (let i = 0; i < segundos; i++) {
    const atual = estado(svc);
    if (atual === "RUNNING" || atual === "STOPPED") return atual;
    execSync("powershell -NoProfile -Command Start-Sleep -Seconds 1");
  }
  return estado(svc);
}

function porta() {
  return lerEnv().PORT || "3000";
}

/** Espera que o health check responda; devolve o URL da aplicação ou null. */
async function aplicacaoResponde(segundos) {
  const url = `http://127.0.0.1:${porta()}/api/health`;
  for (let i = 0; i < segundos; i += 5) {
    try {
      const resposta = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (resposta.ok) return url.replace("/api/health", "");
    } catch {
      // ainda a arrancar
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

function mostrarLogs(linhas = 15) {
  if (!fs.existsSync(PASTA_LOGS)) return console.error("  (sem logs)");
  for (const nome of fs.readdirSync(PASTA_LOGS).filter((f) => f.endsWith(".log"))) {
    const conteudo = fs.readFileSync(path.join(PASTA_LOGS, nome), "utf8").trimEnd().split(/\r?\n/);
    console.error(`== ${nome}`);
    console.error(conteudo.slice(-linhas).join("\n"));
  }
}

module.exports = {
  RAIZ,
  servicos,
  nomeWindows,
  exigirAdministrador,
  estado,
  remover,
  instalar,
  iniciar,
  porta,
  aplicacaoResponde,
  mostrarLogs,
};

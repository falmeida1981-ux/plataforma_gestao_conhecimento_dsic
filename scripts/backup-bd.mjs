// Cópia de segurança da base de dados (e do .env) para uma pasta com data e hora.
// Uso:  node scripts/backup-bd.mjs [etiqueta] [commit-da-versao-atual]
//   ex.: node scripts/backup-bd.mjs antes-deploy 0fc0951
//
// Cria <BACKUP_PASTA>\AAAA-MM-DD_HHMMSS_<etiqueta>\ com:
//   bd.sql.gz   dump completo (mysqldump --single-transaction), comprimido
//   .env        cópia da configuração (inclui a CHAVE_CIFRA, sem a qual os segredos em BD não se leem)
//   versao.txt  commit que estava instalado, para voltar atrás com "git checkout <commit>"
// Mantém as últimas BACKUP_RETENCAO cópias (por omissão 30; 0 = nunca remover).
//
// Repor:  gzip -dc bd.sql.gz | mysql -u root -p dsic_ops
//   (no Windows: 7-Zip para descomprimir, e depois  mysql -u root -p dsic_ops < bd.sql)

import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createGzip } from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const [etiqueta = "manual", commitAtual] = process.argv.slice(2);

function sair(mensagem) {
  console.error(`ERRO: ${mensagem}`);
  process.exit(1);
}

const ficheiroEnv = path.join(raiz, ".env");
if (!fs.existsSync(ficheiroEnv)) sair("falta o ficheiro .env na pasta da plataforma.");
process.loadEnvFile(ficheiroEnv);

const urlTexto = process.env.DATABASE_URL_MIGRACOES;
if (!urlTexto) sair("DATABASE_URL_MIGRACOES não está definida no .env.");
const url = new URL(urlTexto);
const baseDados = decodeURIComponent(url.pathname.replace(/^\//, ""));

const pastaBase = path.resolve(raiz, process.env.BACKUP_PASTA || "backups");
const retencao = Number(process.env.BACKUP_RETENCAO ?? 30);

function encontrarMysqldump() {
  if (process.env.MYSQLDUMP) return process.env.MYSQLDUMP;
  const pastaMysql = "C:\\Program Files\\MySQL";
  if (fs.existsSync(pastaMysql)) {
    // A versão mais recente instalada (ex.: "MySQL Server 8.4").
    const versoes = fs
      .readdirSync(pastaMysql)
      .filter((nome) => nome.startsWith("MySQL Server"))
      .sort()
      .reverse();
    for (const versao of versoes) {
      const candidato = path.join(pastaMysql, versao, "bin", "mysqldump.exe");
      if (fs.existsSync(candidato)) return candidato;
    }
  }
  return "mysqldump"; // no PATH
}

function carimbo() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function commitInstalado() {
  if (commitAtual) return commitAtual;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: raiz }).toString().trim();
  } catch {
    return "desconhecido";
  }
}

async function dump(mysqldump, destino) {
  // Credenciais num ficheiro temporário, para não aparecerem na linha de comandos nem nos logs.
  const credenciais = path.join(os.tmpdir(), `dsic-backup-${randomBytes(8).toString("hex")}.cnf`);
  fs.writeFileSync(
    credenciais,
    [
      "[client]",
      `user="${decodeURIComponent(url.username)}"`,
      `password="${decodeURIComponent(url.password)}"`,
      `host="${url.hostname}"`,
      `port=${url.port || 3306}`,
      "",
    ].join("\n"),
    { mode: 0o600 },
  );

  try {
    await new Promise((resolve, reject) => {
      const processo = spawn(mysqldump, [
        `--defaults-extra-file=${credenciais}`,
        "--single-transaction",
        "--triggers",
        "--no-tablespaces",
        "--set-gtid-purged=OFF",
        "--default-character-set=utf8mb4",
        baseDados,
      ]);

      let erros = "";
      let fim = "";
      processo.stderr.on("data", (d) => (erros += d));
      processo.stdout.on("data", (d) => (fim = (fim + d).slice(-300)));

      const saida = fs.createWriteStream(destino);
      processo.stdout.pipe(createGzip()).pipe(saida);

      processo.on("error", (e) =>
        reject(new Error(`não foi possível executar o mysqldump (${mysqldump}): ${e.message}`)),
      );
      processo.on("close", (codigo) => {
        saida.on("close", () => {
          if (codigo !== 0)
            return reject(new Error(`mysqldump terminou com código ${codigo}: ${erros.trim()}`));
          if (!fim.includes("Dump completed")) return reject(new Error("o dump ficou incompleto."));
          resolve();
        });
      });
    });
  } finally {
    fs.rmSync(credenciais, { force: true });
  }
}

function aplicarRetencao() {
  if (!(retencao > 0)) return;
  const copias = fs
    .readdirSync(pastaBase, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}_\d{6}_/.test(e.name))
    .map((e) => e.name)
    .sort();
  for (const antiga of copias.slice(0, Math.max(0, copias.length - retencao))) {
    fs.rmSync(path.join(pastaBase, antiga), { recursive: true, force: true });
    console.log(`  cópia antiga removida (retenção de ${retencao}): ${antiga}`);
  }
}

const pasta = path.join(pastaBase, `${carimbo()}_${etiqueta}`);
fs.mkdirSync(pasta, { recursive: true });
const mysqldump = encontrarMysqldump();

console.log(`A fazer cópia de segurança de "${baseDados}" para ${pasta} ...`);
try {
  await dump(mysqldump, path.join(pasta, "bd.sql.gz"));
} catch (erro) {
  fs.rmSync(pasta, { recursive: true, force: true });
  sair(erro.message);
}
fs.copyFileSync(ficheiroEnv, path.join(pasta, ".env"));
fs.writeFileSync(
  path.join(pasta, "versao.txt"),
  `commit=${commitInstalado()}\ndata=${new Date().toISOString()}\netiqueta=${etiqueta}\n`,
);

const tamanhoKb = Math.ceil(fs.statSync(path.join(pasta, "bd.sql.gz")).size / 1024);
console.log(`Cópia de segurança concluída (${tamanhoKb} KB).`);
aplicarRetencao();

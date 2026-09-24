import "dotenv/config";
import { defineConfig } from "prisma/config";

// O CLI do Prisma (migrate, studio) liga-se com o utilizador dono do esquema (DDL).
// A aplicação e o worker usam DATABASE_URL, com um utilizador só de DML (ver src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL_MIGRACOES"],
    shadowDatabaseUrl: process.env["DATABASE_URL_SHADOW"],
  },
});

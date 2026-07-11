import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma Studio and migrations need a DIRECT Postgres connection.
// For Neon: use the non-pooler URL (without "-pooler" in the hostname).
// Fall back to DATABASE_URL if DIRECT_DATABASE_URL is not set.
const databaseUrl =
  process.env["DIRECT_DATABASE_URL"] ?? process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});

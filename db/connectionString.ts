import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

const candidates = [
  "POSTGRES_URL",
  "DATABASE_URL",
  /** Vercel + Neon "Prisma" / pooled string */
  "POSTGRES_PRISMA_URL",
] as const;

function readFromProcessEnv(): string {
  for (const key of candidates) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return "";
}

/**
 * When running outside the Next.js runtime (drizzle-kit, one-off scripts, or rare
 * import order issues), `process.env` may be empty until we load `.env` files.
 * Next.js normally inlines .env* on the server; this keeps CLI and the db module
 * working from the same files.
 */
function loadEnvFiles() {
  const cwd = process.cwd();
  loadEnv({ path: resolve(cwd, ".env") });
  loadEnv({ path: resolve(cwd, ".env.local"), override: true });
}

/**
 * Shared URL for Neon/Postgres. Tries `POSTGRES_URL`, `DATABASE_URL`, then
 * `POSTGRES_PRISMA_URL` (Vercel/Neon pooler + Prisma template).
 */
export function getDatabaseUrl(): string {
  let url = readFromProcessEnv();
  if (!url) {
    loadEnvFiles();
    url = readFromProcessEnv();
  }
  if (!url) {
    throw new Error(
      `No database connection string. Add to .env or .env.local in the project root (next to package.json), for example:\n` +
        `POSTGRES_URL="postgresql://…" (or DATABASE_URL, or Vercel’s POSTGRES_PRISMA_URL from Neon)`,
    );
  }
  return url;
}

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getProductionEnvIssues } from "../src/lib/env";

const checks: { name: string; ok: boolean; hint?: string }[] = [];

function pass(name: string) {
  checks.push({ name, ok: true });
}

function fail(name: string, hint: string) {
  checks.push({ name, ok: false, hint });
}

async function main() {
  console.log("NeuralHub production preflight\n");

  if (process.env.NODE_ENV === "production") {
    pass("NODE_ENV=production");
  } else {
    console.log("ℹ NODE_ENV is not production (OK for local preflight)\n");
  }

  const envIssues = getProductionEnvIssues();
  if (envIssues.length === 0) {
    pass("Required production env vars");
  } else {
    fail("Required production env vars", envIssues.join("; "));
  }

  if (process.env.TRUST_PROXY === "true" || process.env.VERCEL === "1") {
    pass("Trusted proxy for rate limits");
  } else {
    fail(
      "TRUST_PROXY",
      'Set TRUST_PROXY=true on Vercel (or rely on VERCEL=1 auto-detection)',
    );
  }

  const dbUrl =
    process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (!dbUrl) {
    fail("Database URL", "Set DIRECT_DATABASE_URL");
  } else if (dbUrl.includes("-pooler")) {
    fail(
      "Database URL",
      "Use Neon direct host (no -pooler) for DIRECT_DATABASE_URL",
    );
  } else {
    try {
      const pool = new Pool({ connectionString: dbUrl });
      const adapter = new PrismaPg(pool);
      const { PrismaClient } = await import("../src/generated/prisma/client");
      const prisma = new PrismaClient({ adapter });
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      await pool.end();
      pass("Database connectivity");
    } catch (error) {
      fail(
        "Database connectivity",
        error instanceof Error ? error.message : "Connection failed",
      );
    }
  }

  if (process.env.AUTH_URL && process.env.NEXT_PUBLIC_APP_URL) {
    if (process.env.AUTH_URL === process.env.NEXT_PUBLIC_APP_URL) {
      pass("AUTH_URL matches NEXT_PUBLIC_APP_URL");
    } else {
      fail(
        "Auth URLs",
        "AUTH_URL and NEXT_PUBLIC_APP_URL should match your production domain",
      );
    }

    if (
      process.env.AUTH_URL.includes("localhost") ||
      process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ) {
      fail(
        "Auth URLs",
        "Use your live Vercel domain, not localhost, for real user verification",
      );
    }
  } else {
    fail("Auth URLs", "Set AUTH_URL and NEXT_PUBLIC_APP_URL to https://your-domain");
  }

  if (!process.env.RESEND_API_KEY) {
    fail("RESEND_API_KEY", "Required to send verification emails in production");
  }

  console.log("Results:\n");
  for (const check of checks) {
    const icon = check.ok ? "✓" : "✗";
    console.log(`${icon} ${check.name}`);
    if (!check.ok && check.hint) {
      console.log(`  → ${check.hint}`);
    }
  }

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${failed === 0 ? "Ready to deploy." : `${failed} issue(s) to fix.`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

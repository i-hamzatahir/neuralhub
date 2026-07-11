import "dotenv/config";
import { Pool } from "pg";

const url = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

function maskUrl(connectionUrl: string): string {
  try {
    const parsed = new URL(connectionUrl);
    if (parsed.password) parsed.password = "****";
    return parsed.toString();
  } catch {
    return "(invalid url)";
  }
}

function isPlaceholder(connectionUrl: string | undefined): boolean {
  if (!connectionUrl) return true;
  return (
    connectionUrl.includes("USER:PASSWORD@HOST") ||
    connectionUrl.includes("@HOST") ||
    connectionUrl.includes("localhost:51213")
  );
}

async function main() {
  console.log("NeuralHub — Database connection check\n");

  if (isPlaceholder(url)) {
    console.error("❌ DATABASE_URL is still a placeholder.\n");
    console.error("Fix:");
    console.error("  1. Create a free database at https://neon.tech");
    console.error("  2. Copy the connection string from Neon dashboard");
    console.error("  3. Paste it into .env as DIRECT_DATABASE_URL (recommended for Studio/migrations)");
    console.error("     Example:");
    console.error(
      '     DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neuralhub?sslmode=require"',
    );
    process.exit(1);
  }

  console.log(`Connecting to: ${maskUrl(url!)}\n`);

  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 10000 });

  try {
    const version = await pool.query("SELECT version()");
    console.log("✅ Connected successfully");
    console.log(`   ${version.rows[0].version.split(",")[0]}\n`);

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.log("⚠️  Database is empty — no tables found.");
      console.log("   Run: npm run db:migrate");
      console.log("   Then: npm run db:seed\n");
    } else {
      console.log(`✅ Found ${tables.rows.length} tables:`);
      for (const row of tables.rows) {
        console.log(`   - ${row.table_name}`);
      }
      console.log();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Connection failed\n");
    console.error(`   ${message}\n`);
    console.error("Common fixes for Neon:");
    console.error("  • Use the DIRECT connection string (not the pooler URL) for Studio");
    console.error("  • Ensure sslmode=require is in the connection string");
    console.error("  • Remove any ?schema= parameter from the URL");
    console.error("  • Verify username, password, and host are correct");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

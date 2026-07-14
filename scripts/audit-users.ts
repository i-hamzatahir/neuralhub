import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  });

  try {
    const [users, byRole, verified, recent, audits, articles] =
      await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM "User"'),
        pool.query(
          'SELECT role, COUNT(*)::int AS count FROM "User" GROUP BY role ORDER BY role',
        ),
        pool.query(
          'SELECT COUNT(*)::int AS count FROM "User" WHERE "emailVerified" IS NOT NULL',
        ),
        pool.query(
          'SELECT email, role, "emailVerified" IS NOT NULL AS verified, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5',
        ),
        pool.query(
          `SELECT action, COUNT(*)::int AS count
           FROM "AuditLog"
           GROUP BY action
           ORDER BY count DESC
           LIMIT 15`,
        ),
        pool.query('SELECT COUNT(*)::int AS count FROM "Article"'),
      ]);

    console.log("=== NeuralHub user audit ===\n");
    console.log("Total users:", users.rows[0].count);
    console.log("Verified users:", verified.rows[0].count);
    console.log("Total articles:", articles.rows[0].count);
    console.log("\nUsers by role:");
    for (const row of byRole.rows) {
      console.log(`  ${row.role}: ${row.count}`);
    }
    console.log("\nMost recent accounts:");
    for (const row of recent.rows) {
      const email = String(row.email).replace(/(.{2}).+(@.+)/, "$1***$2");
      console.log(
        `  ${email} | ${row.role} | verified=${row.verified} | ${row.createdat ?? row.createdAt}`,
      );
    }
    console.log("\nTop audit log actions:");
    for (const row of audits.rows) {
      console.log(`  ${row.action}: ${row.count}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { buildArticleSearchText } from "../src/lib/utils/search-text";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Backfilling Article.searchText...");

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  let updated = 0;
  for (const article of articles) {
    const searchText = buildArticleSearchText(article);
    await prisma.article.update({
      where: { id: article.id },
      data: { searchText },
    });
    updated += 1;
  }

  console.log(`Updated searchText for ${updated} articles.`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

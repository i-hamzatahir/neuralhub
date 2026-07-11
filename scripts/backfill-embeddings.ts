import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { generateArticleEmbedding } from "../src/lib/services/ai/ai.service";
import { buildArticleSearchText } from "../src/lib/utils/search-text";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Backfilling Article.embedding...");

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      embedding: { equals: Prisma.DbNull },
    },
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
  let skipped = 0;

  for (const article of articles) {
    const text = buildArticleSearchText(article);
    const embedding = await generateArticleEmbedding(text);

    if (!embedding) {
      skipped += 1;
      continue;
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { embedding },
    });
    updated += 1;

    if (updated % 10 === 0) {
      console.log(`Updated ${updated} embeddings…`);
    }
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
}

main()
  .catch((error) => {
    console.error("Embedding backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

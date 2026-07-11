import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";
import type { SearchFilters, SearchProvider, SearchResult } from "../types";

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatar: true,
  image: true,
  bio: true,
} as const;

const articleInclude = {
  author: { select: authorSelect },
  category: true,
  tags: { include: { tag: true } },
} as const;

function buildWhereClause(filters: SearchFilters, query: string): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`a.status = 'PUBLISHED'`];

  if (filters.categorySlug) {
    conditions.push(Prisma.sql`c.slug = ${filters.categorySlug}`);
  }

  if (filters.tagSlug) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ArticleTag" at
      INNER JOIN "Tag" t ON at."tagId" = t.id
      WHERE at."articleId" = a.id AND t.slug = ${filters.tagSlug}
    )`);
  }

  if (filters.authorUsername) {
    conditions.push(Prisma.sql`u.username = ${filters.authorUsername}`);
  }

  if (query) {
    const likeQuery = `%${query}%`;
    conditions.push(Prisma.sql`(
      to_tsvector('english', COALESCE(a."searchText", '')) @@ plainto_tsquery('english', ${query})
      OR a.title ILIKE ${likeQuery}
      OR COALESCE(a.excerpt, '') ILIKE ${likeQuery}
      OR u.username ILIKE ${likeQuery}
      OR COALESCE(u.name, '') ILIKE ${likeQuery}
    )`);
  }

  return Prisma.join(conditions, " AND ");
}

export const postgresFtsProvider: SearchProvider = {
  async searchArticles(filters: SearchFilters): Promise<SearchResult> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
    const skip = (page - 1) * limit;
    const query = filters.query?.trim() ?? "";
    const whereClause = buildWhereClause(filters, query);

    const orderClause = query
      ? Prisma.sql`ts_rank(
          to_tsvector('english', COALESCE(a."searchText", '')),
          plainto_tsquery('english', ${query})
        ) DESC, a."publishedAt" DESC`
      : Prisma.sql`a."publishedAt" DESC`;

    const [countResult, idRows] = await Promise.all([
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count
        FROM "Article" a
        INNER JOIN "Category" c ON a."categoryId" = c.id
        INNER JOIN "User" u ON a."authorId" = u.id
        WHERE ${whereClause}
      `,
      prisma.$queryRaw<{ id: string }[]>`
        SELECT a.id
        FROM "Article" a
        INNER JOIN "Category" c ON a."categoryId" = c.id
        INNER JOIN "User" u ON a."authorId" = u.id
        WHERE ${whereClause}
        ORDER BY ${orderClause}
        LIMIT ${limit} OFFSET ${skip}
      `,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const ids = idRows.map((row) => row.id);

    let articles: ArticleWithRelations[] = [];
    if (ids.length > 0) {
      const rows = await prisma.article.findMany({
        where: { id: { in: ids } },
        include: articleInclude,
      });
      const byId = new Map(rows.map((row) => [row.id, row as ArticleWithRelations]));
      articles = ids
        .map((id) => byId.get(id))
        .filter((row): row is ArticleWithRelations => row !== undefined);
    }

    return {
      articles,
      total,
      pages: Math.ceil(total / limit),
      query,
      filters: { ...filters, page, limit },
    };
  },
};

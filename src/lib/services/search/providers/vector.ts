import type { SearchFilters, SearchProvider, SearchResult } from "../types";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

function emptyResult(
  filters: SearchFilters,
  page: number,
  limit: number,
  query: string
): SearchResult {
  return {
    articles: [],
    total: 0,
    pages: 0,
    query,
    filters: { ...filters, page, limit },
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const vectorSearchProvider: SearchProvider = {
  async searchArticles(filters: SearchFilters): Promise<SearchResult> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
    const query = filters.query?.trim() ?? "";

    if (!query) {
      return emptyResult(filters, page, limit, query);
    }

    const queryEmbedding = await getQueryEmbedding(query);
    if (!queryEmbedding) {
      return emptyResult(filters, page, limit, query);
    }

    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        embedding: { not: Prisma.DbNull },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            image: true,
            bio: true,
          },
        },
        category: true,
        tags: { include: { tag: true } },
      },
      take: 200,
    });

    const scored = articles
      .map((article) => {
        const emb = article.embedding as number[] | null;
        if (!emb || !Array.isArray(emb)) return null;
        return {
          article: article as ArticleWithRelations,
          score: cosineSimilarity(queryEmbedding, emb),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.score > 0.1)
      .sort((a, b) => b.score - a.score);

    const total = scored.length;
    const skip = (page - 1) * limit;
    const slice = scored.slice(skip, skip + limit);

    return {
      articles: slice.map((s) => s.article),
      total,
      pages: Math.ceil(total / limit),
      query,
      filters: { ...filters, page, limit },
    };
  },
};

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: query.slice(0, 8000),
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      data?: { embedding?: number[] }[];
    };
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

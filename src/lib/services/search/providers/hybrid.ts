import type { SearchFilters, SearchProvider, SearchResult } from "../types";
import { postgresFtsProvider } from "./postgres-fts";
import { vectorSearchProvider } from "./vector";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

function mergeResults(
  fts: SearchResult,
  vector: SearchResult,
  filters: SearchFilters,
  page: number,
  limit: number,
  query: string
): SearchResult {
  const scoreMap = new Map<string, { article: ArticleWithRelations; score: number }>();

  fts.articles.forEach((article, index) => {
    const ftsScore = 1 - index / Math.max(fts.articles.length, 1);
    scoreMap.set(article.id, { article, score: ftsScore * 0.6 });
  });

  vector.articles.forEach((article, index) => {
    const vectorScore = 1 - index / Math.max(vector.articles.length, 1);
    const existing = scoreMap.get(article.id);
    if (existing) {
      existing.score += vectorScore * 0.4;
    } else {
      scoreMap.set(article.id, { article, score: vectorScore * 0.4 });
    }
  });

  const merged = [...scoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article);

  const total = merged.length;
  const skip = (page - 1) * limit;

  return {
    articles: merged.slice(skip, skip + limit),
    total,
    pages: Math.ceil(total / limit),
    query,
    filters: { ...filters, page, limit },
  };
}

export const hybridSearchProvider: SearchProvider = {
  async searchArticles(filters: SearchFilters): Promise<SearchResult> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
    const query = filters.query?.trim() ?? "";

    if (!query) {
      return postgresFtsProvider.searchArticles(filters);
    }

    const [fts, vector] = await Promise.all([
      postgresFtsProvider.searchArticles({ ...filters, page: 1, limit: 50 }),
      vectorSearchProvider.searchArticles({ ...filters, page: 1, limit: 50 }),
    ]);

    if (vector.articles.length === 0) return fts;
    if (fts.articles.length === 0) return vector;

    return mergeResults(fts, vector, filters, page, limit, query);
  },
};

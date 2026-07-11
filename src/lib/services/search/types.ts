import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

export interface SearchFilters {
  query?: string;
  categorySlug?: string;
  tagSlug?: string;
  authorUsername?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  articles: ArticleWithRelations[];
  total: number;
  pages: number;
  query: string;
  filters: Required<Pick<SearchFilters, "page" | "limit">> & SearchFilters;
}

export interface SearchProvider {
  searchArticles(filters: SearchFilters): Promise<SearchResult>;
}

export type FutureSearchProvider = "postgres-fts" | "vector" | "hybrid";

export interface SearchProviderRegistry {
  active: FutureSearchProvider;
  /** Hook for Phase E — swap in vector/RAG provider without changing UI */
  vector?: SearchProvider;
}

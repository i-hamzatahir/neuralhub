import { prisma } from "@/lib/db/prisma";
import { postgresFtsProvider } from "@/lib/services/search/providers/postgres-fts";
import { vectorSearchProvider } from "@/lib/services/search/providers/vector";
import { hybridSearchProvider } from "@/lib/services/search/providers/hybrid";
import type {
  FutureSearchProvider,
  SearchFilters,
  SearchProvider,
  SearchResult,
} from "@/lib/services/search/types";

const providers: Record<FutureSearchProvider, SearchProvider | undefined> = {
  "postgres-fts": postgresFtsProvider,
  vector: vectorSearchProvider,
  hybrid: hybridSearchProvider,
};

function getActiveProvider(): SearchProvider {
  const envProvider = process.env.SEARCH_PROVIDER as
    | FutureSearchProvider
    | undefined;
  const key = envProvider ?? "postgres-fts";
  return providers[key] ?? postgresFtsProvider;
}

export async function searchArticles(
  filters: SearchFilters,
): Promise<SearchResult> {
  return getActiveProvider().searchArticles(filters);
}

export async function listSearchFilterOptions() {
  const [categories, tags, authors] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { articles: true } },
      },
    }),
    prisma.user.findMany({
      where: { articles: { some: { status: "PUBLISHED" } } },
      select: { username: true, name: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return { categories, tags, authors };
}

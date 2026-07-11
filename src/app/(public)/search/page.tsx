import { Suspense } from "react";
import Link from "next/link";
import {
  listSearchFilterOptions,
  searchArticles,
} from "@/lib/services/search";
import { SearchForm } from "@/components/search/search-form";
import { ArticleCard } from "@/components/articles/article-card";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    author?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const title = q?.trim() ? `Search: ${q.trim()}` : "Search";
  const description = q?.trim()
    ? `Search results for "${q.trim()}" on NeuralHub.`
    : "Search articles on AI, data science, machine learning, and technology.";

  return buildPageMetadata({ title, description, path: "/search" });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const categorySlug = params.category ?? "";
  const tagSlug = params.tag ?? "";
  const authorUsername = params.author ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [options, results] = await Promise.all([
    listSearchFilterOptions(),
    searchArticles({
      query: query || undefined,
      categorySlug: categorySlug || undefined,
      tagSlug: tagSlug || undefined,
      authorUsername: authorUsername || undefined,
      page,
    }),
  ]);

  const hasFilters = query || categorySlug || tagSlug || authorUsername;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "Search",
          description: "Search NeuralHub articles, topics, and authors.",
          path: "/search",
        })}
      />

      <header className="mb-8">
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">Search</h1>
        <p className="text-body mt-2 text-muted-foreground">
          Find articles across AI, data science, machine learning, and more.
        </p>
      </header>

      <Suspense fallback={<div className="h-32 animate-shimmer rounded-xl" />}>
        <SearchForm
          key={`${query}|${categorySlug}|${tagSlug}|${authorUsername}`}
          options={options}
          initialQuery={query}
          initialCategory={categorySlug}
          initialTag={tagSlug}
          initialAuthor={authorUsername}
        />
      </Suspense>

      <section className="mt-10">
        <p className="mb-6 text-sm text-muted-foreground">
          {hasFilters ? (
            <>
              {results.total} result{results.total !== 1 ? "s" : ""}
              {query && (
                <>
                  {" "}
                  for <span className="font-medium text-foreground">&quot;{query}&quot;</span>
                </>
              )}
            </>
          ) : (
            <>Showing latest published articles</>
          )}
        </p>

        {results.articles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-muted-foreground">
              No articles match your search. Try different keywords or filters.
            </p>
            <Link
              href="/articles"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {results.pages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: results.pages }, (_, i) => i + 1).map((p) => {
              const pageParams = new URLSearchParams();
              if (query) pageParams.set("q", query);
              if (categorySlug) pageParams.set("category", categorySlug);
              if (tagSlug) pageParams.set("tag", tagSlug);
              if (authorUsername) pageParams.set("author", authorUsername);
              if (p > 1) pageParams.set("page", String(p));
              const href = pageParams.toString()
                ? `/search?${pageParams}`
                : "/search";

              return (
                <Link
                  key={p}
                  href={href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-accent"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

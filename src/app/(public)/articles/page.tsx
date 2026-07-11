import Link from "next/link";
import { listPublishedArticles } from "@/lib/services/articles/article.service";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

export const metadata = buildPageMetadata({
  title: "Articles",
  description:
    "Browse expert articles on AI, machine learning, data science, programming, and technology from NeuralHub.",
  path: "/articles",
  keywords: [
    "AI articles",
    "machine learning tutorials",
    "data science guides",
    "programming blog",
    "technology articles",
  ],
});

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { articles, total, pages } = await listPublishedArticles({ page });

  return (
    <div className="blog-container py-10 sm:py-12">
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "Articles",
          description:
            "Browse expert articles on AI, machine learning, data science, programming, and technology.",
          path: "/articles",
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Articles" },
        ]}
        className="mb-6"
      />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Articles</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {total} published article{total !== 1 ? "s" : ""} covering artificial
          intelligence, data science, machine learning, programming, and
          technology research.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No articles published yet. Check back soon.
        </p>
      ) : (
        <div className="mt-8">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Article pagination"
        >
          {page > 1 && (
            <Link
              href={`/articles?page=${page - 1}`}
              rel="prev"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/articles?page=${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < pages && (
            <Link
              href={`/articles?page=${page + 1}`}
              rel="next"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

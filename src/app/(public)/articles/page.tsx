import { listPublishedArticles } from "@/lib/services/articles/article.service";
import { ArticleCard } from "@/components/articles/article-card";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

export const metadata = buildPageMetadata({
  title: "Articles",
  description:
    "Explore articles on AI, data science, machine learning, programming, and technology.",
  path: "/articles",
});

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { articles, total, pages } = await listPublishedArticles({ page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "Articles",
          description:
            "Explore articles on AI, data science, machine learning, programming, and technology.",
          path: "/articles",
        })}
      />
      <header className="mb-10">
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">Articles</h1>
        <p className="text-body mt-2">
          {total} article{total !== 1 ? "s" : ""} published
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No articles published yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/articles?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

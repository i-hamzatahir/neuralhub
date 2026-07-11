import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { CompactArticleRow } from "@/components/articles/compact-article-row";
import { CategorySectionBlock } from "@/components/home/category-section-block";
import type {
  ArticleWithRelations,
  CategorySectionPreview,
} from "@/lib/services/articles/article.service";
import type { Category } from "@/generated/prisma/client";

interface HomeContentProps {
  featuredArticle: ArticleWithRelations | null;
  latestArticles: ArticleWithRelations[];
  popularArticles: ArticleWithRelations[];
  categorySections: CategorySectionPreview[];
  categories: Category[];
}

export function HomeContent({
  featuredArticle,
  latestArticles,
  popularArticles,
  categorySections,
  categories,
}: HomeContentProps) {
  return (
    <div className="blog-container py-10 sm:py-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {siteConfig.name}: AI, Data Science & Technology Articles
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {siteConfig.description} Explore tutorials, research summaries, and
          practical guides written by engineers and researchers.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-sm font-semibold text-foreground">
          Browse by technology area
        </h2>
        <nav
          className="mt-3 flex flex-wrap gap-2"
          aria-label="Article categories"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </section>

      {featuredArticle && (
        <section className="mt-12" aria-labelledby="featured-heading">
          <h2
            id="featured-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Featured article
          </h2>
          <ArticleListItem article={featuredArticle} featured />
        </section>
      )}

      <section
        className="mt-12 grid gap-8 lg:grid-cols-2"
        aria-label="Site-wide article highlights"
      >
        {latestArticles.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-tight">
                Latest across NeuralHub
              </h2>
              <Link
                href="/articles"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div>
              {latestArticles.slice(0, 5).map((article) => (
                <CompactArticleRow key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {popularArticles.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-tight">
                Most viewed articles
              </h2>
              <Link
                href="/articles"
                className="text-sm font-medium text-primary hover:underline"
              >
                Explore more
              </Link>
            </div>
            <div>
              {popularArticles.slice(0, 5).map((article, index) => (
                <CompactArticleRow
                  key={article.id}
                  article={article}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {categorySections.length > 0 && (
        <section className="mt-14" aria-labelledby="sections-heading">
          <div className="mb-6 max-w-3xl">
            <h2 id="sections-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explore by section
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Latest and most-read articles from AI, machine learning, data
              science, programming, cloud, developer tools, and emerging
              technology topics.
            </p>
          </div>
          <div className="space-y-6">
            {categorySections.map((section) => (
              <CategorySectionBlock key={section.category.slug} section={section} />
            ))}
          </div>
        </section>
      )}

      {latestArticles.length > 5 && (
        <section className="mt-14" aria-labelledby="more-latest-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              id="more-latest-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              More recent articles
            </h2>
            <Link
              href="/articles"
              className="text-sm font-medium text-primary hover:underline"
            >
              Full archive
            </Link>
          </div>
          <div>
            {latestArticles.slice(5).map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 rounded-lg border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight">Write for NeuralHub</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Publish in-depth tutorials and technical articles. Reach readers
          interested in AI, machine learning, data science, and software
          engineering.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/write"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start writing
          </Link>
          <Link
            href="/about"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            About the platform
          </Link>
        </div>
      </section>
    </div>
  );
}

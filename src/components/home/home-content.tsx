import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { HomeTopicGrid } from "@/components/home/home-topic-grid";
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
  const heroArticle = featuredArticle ?? latestArticles[0] ?? null;
  const gridArticles = latestArticles.filter(
    (article) => article.id !== heroArticle?.id,
  );

  return (
    <div className="blog-container py-8 sm:py-10">
      <HomeHero article={heroArticle} />

      {categories.length > 0 && (
        <nav
          className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Article categories"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {gridArticles.length > 0 ? (
            <section aria-labelledby="latest-heading">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="latest-heading"
                    className="text-2xl font-bold tracking-tight"
                  >
                    Latest articles
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tutorials, explainers, and practical guides.
                  </p>
                </div>
                <Link
                  href="/articles"
                  className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              <div className="mt-6 sm:hidden">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          ) : (
            !heroArticle && (
              <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No articles published yet. Check back soon.
              </p>
            )
          )}

          <HomeTopicGrid sections={categorySections} />
        </div>

        <HomeSidebar popularArticles={popularArticles} />
      </div>
    </div>
  );
}

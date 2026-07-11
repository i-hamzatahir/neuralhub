import Link from "next/link";
import type { CategorySectionPreview } from "@/lib/services/articles/article.service";
import { CompactArticleRow } from "@/components/articles/compact-article-row";

interface CategorySectionBlockProps {
  section: CategorySectionPreview;
}

export function CategorySectionBlock({ section }: CategorySectionBlockProps) {
  const { category, latest, popular } = section;
  const sectionId = category.slug;

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      aria-labelledby={`${sectionId}-heading`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color ?? "#1d4ed8" }}
              aria-hidden
            />
            <h2
              id={`${sectionId}-heading`}
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              <Link
                href={`/${category.slug}`}
                className="hover:text-primary"
              >
                {category.name}
              </Link>
            </h2>
          </div>
          {category.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
        <Link
          href={`/${category.slug}`}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          View all {category.name} articles →
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Latest
          </h3>
          {latest.length > 0 ? (
            <div className="mt-3">
              {latest.map((article) => (
                <CompactArticleRow key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No articles yet in this section.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Most viewed
          </h3>
          {popular.length > 0 ? (
            <div className="mt-3">
              {popular.map((article, index) => (
                <CompactArticleRow
                  key={article.id}
                  article={article}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No view data yet for this section.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategorySectionPreview } from "@/lib/services/articles/article.service";

interface HomeTopicGridProps {
  sections: CategorySectionPreview[];
}

export function HomeTopicGrid({ sections }: HomeTopicGridProps) {
  if (sections.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="topics-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="topics-heading" className="text-2xl font-bold tracking-tight">
            Browse by topic
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump into a category or read the latest post in each area.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ category, latest }) => {
          const spotlight = latest[0];

          return (
            <article
              key={category.slug}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/25 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color ?? "#1d4ed8" }}
                    aria-hidden
                  />
                  <h3 className="font-semibold tracking-tight">
                    <Link
                      href={`/${category.slug}`}
                      className="transition-colors group-hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </h3>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </div>

              {category.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              )}

              {spotlight ? (
                <p className="mt-4 text-sm leading-snug">
                  <span className="text-muted-foreground">Latest: </span>
                  <Link
                    href={`/articles/${spotlight.slug}`}
                    className="font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {spotlight.title}
                  </Link>
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No articles yet.
                </p>
              )}

              <Link
                href={`/${category.slug}`}
                className="mt-auto pt-4 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                View {category.name}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

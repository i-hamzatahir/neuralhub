import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { isPersonalSite } from "@/config/site-mode";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface HomeHeroProps {
  article: ArticleWithRelations | null;
}

export function HomeHero({ article }: HomeHeroProps) {
  if (article) {
    const published = article.publishedAt;

    return (
      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        aria-labelledby="home-hero-heading"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          {article.coverImage ? (
            <Link
              href={`/articles/${article.slug}`}
              className="relative block aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto lg:min-h-[22rem]"
            >
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </Link>
          ) : (
            <div className="hidden bg-gradient-to-br from-primary/10 via-muted to-accent lg:block lg:min-h-[22rem]" />
          )}

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span
                className="rounded-full px-2.5 py-1 uppercase tracking-wide"
                style={{
                  backgroundColor: `${article.category.color ?? "#1d4ed8"}18`,
                  color: article.category.color ?? "#1d4ed8",
                }}
              >
                {article.category.name}
              </span>
              {published && (
                <time
                  dateTime={published.toISOString()}
                  className="text-muted-foreground"
                >
                  {formatDate(published)}
                </time>
              )}
            </div>

            <h1
              id="home-hero-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
            >
              <Link
                href={`/articles/${article.slug}`}
                className="transition-colors hover:text-primary"
              >
                {article.title}
              </Link>
            </h1>

            {article.excerpt && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {article.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/articles/${article.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.07] via-card to-accent/80 px-6 py-12 sm:px-10 sm:py-16"
      aria-labelledby="home-hero-heading"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative max-w-2xl">
        <p className="text-label text-primary">Welcome to {siteConfig.name}</p>
        <h1
          id="home-hero-heading"
          className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          {isPersonalSite
            ? "AI and engineering, explained clearly."
            : "Expert articles on AI, data science, and technology."}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/articles"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse articles
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/start-here"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-background/80 px-5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Start here
          </Link>
        </div>
      </div>
    </section>
  );
}

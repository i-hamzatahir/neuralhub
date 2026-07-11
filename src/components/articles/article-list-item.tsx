import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";
import { cn } from "@/lib/utils/cn";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ArticleListItemProps {
  article: ArticleWithRelations;
  featured?: boolean;
  className?: string;
}

export function ArticleListItem({
  article,
  featured = false,
  className,
}: ArticleListItemProps) {
  const authorName = article.author.name ?? article.author.username;
  const published = article.publishedAt;

  return (
    <article
      className={cn(
        "group border-b border-border py-6 last:border-b-0",
        featured && "border border-border rounded-xl px-5 sm:px-6 mb-0 last:mb-0 bg-card",
        className,
      )}
    >
      <div className={cn("flex gap-5", featured && "flex-col sm:flex-row sm:items-start")}>
        {article.coverImage && (
          <Link
            href={`/articles/${article.slug}`}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg bg-muted",
              featured ? "aspect-[16/9] w-full sm:w-56" : "h-24 w-32 sm:h-28 sm:w-40",
            )}
          >
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes={featured ? "224px" : "160px"}
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link
              href={`/${article.category.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {article.category.name}
            </Link>
            {published && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={published.toISOString()}>
                  {formatDate(published)}
                </time>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
            </span>
          </div>

          <h2
            className={cn(
              "mt-2 font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary",
              featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h2>

          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {article.excerpt}
            </p>
          )}

          <p className="mt-3 text-sm text-muted-foreground">
            By{" "}
            <Link
              href={`/authors/${article.author.username}`}
              className="font-medium text-foreground hover:text-primary"
            >
              {authorName}
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}

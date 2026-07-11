import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface CompactArticleRowProps {
  article: ArticleWithRelations;
  rank?: number;
}

export function CompactArticleRow({ article, rank }: CompactArticleRowProps) {
  const published = article.publishedAt;

  return (
    <article className="group border-b border-border py-3 last:border-b-0">
      <div className="flex gap-3">
        {rank !== undefined && (
          <span className="w-6 shrink-0 pt-0.5 text-sm font-semibold text-muted-foreground/60">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug sm:text-base">
            <Link
              href={`/articles/${article.slug}`}
              className="text-foreground transition-colors group-hover:text-primary"
            >
              {article.title}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {published && (
              <time dateTime={published.toISOString()}>
                {formatDate(published)}
              </time>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount.toLocaleString()} views
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

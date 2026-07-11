import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";
import { cn } from "@/lib/utils/cn";

interface ArticleCardProps {
  article: ArticleWithRelations;
  featured?: boolean;
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  const authorImage = article.author.image ?? article.author.avatar;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
        "hover:border-primary/20 hover:shadow-md",
        featured && "lg:flex-row lg:items-stretch",
      )}
    >
      {article.coverImage && (
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            featured ? "lg:w-[42%]" : "aspect-[16/10]",
          )}
        >
          <Image
            src={article.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes={featured ? "40vw" : "33vw"}
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col p-5", featured && "lg:p-7")}>
        <div className="mb-3 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: `${article.category.color ?? "#0d6e6e"}18`,
              color: article.category.color ?? "#0d6e6e",
            }}
          >
            {article.category.name}
          </span>
        </div>
        <h3
          className={cn(
            "font-display font-semibold tracking-tight transition-colors group-hover:text-primary",
            featured ? "text-2xl lg:text-[1.75rem]" : "text-xl",
          )}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {authorImage ? (
              <Image
                src={authorImage}
                alt=""
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                {(article.author.name ?? article.author.username).charAt(0)}
              </div>
            )}
            <span>{article.author.name ?? article.author.username}</span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

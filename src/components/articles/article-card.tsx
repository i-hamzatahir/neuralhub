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
        "group flex flex-col rounded-xl border border-border bg-card transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5",
        featured && "lg:flex-row lg:items-stretch",
      )}
    >
      {article.coverImage && (
        <div
          className={cn(
            "relative overflow-hidden rounded-t-xl bg-muted",
            featured ? "lg:w-2/5 lg:rounded-l-xl lg:rounded-tr-none" : "aspect-[16/9]",
          )}
        >
          <Image
            src={article.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? "40vw" : "33vw"}
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col p-5", featured && "lg:p-6")}>
        <div className="mb-2 flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${article.category.color ?? "#5e6ad2"}20`,
              color: article.category.color ?? "#5e6ad2",
            }}
          >
            {article.category.name}
          </span>
        </div>
        <h3
          className={cn(
            "text-display font-semibold tracking-tight group-hover:text-primary transition-colors",
            featured ? "text-xl lg:text-2xl" : "text-lg",
          )}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted-foreground">
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
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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

import Link from "next/link";
import Image from "next/image";
import { ArticleContent } from "@/components/articles/article-content";
import { ArticleToc } from "@/components/articles/article-toc";
import { ShareButtons } from "@/components/articles/share-buttons";
import { ArticleEngagementBar } from "@/components/engagement/article-engagement-bar";
import { ArticleComments } from "@/components/engagement/article-comments";
import { AdSlot } from "@/components/ads/ad-slot";
import { AffiliateDisclosure } from "@/components/articles/affiliate-disclosure";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";
import type { CommentWithAuthor } from "@/lib/services/engagement/engagement.service";
import type { TocHeading } from "@/lib/utils/tiptap-headings";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ArticleReaderProps {
  article: ArticleWithRelations;
  related: ArticleWithRelations[];
  headings: TocHeading[];
  shareUrl: string;
  engagement: {
    likeCount: number;
    liked: boolean;
    bookmarked: boolean;
  };
  comments: CommentWithAuthor[];
  currentUserId?: string;
  isLoggedIn: boolean;
}

export function ArticleReader({
  article,
  related,
  headings,
  shareUrl,
  engagement,
  comments,
  currentUserId,
  isLoggedIn,
}: ArticleReaderProps) {
  const authorImage = article.author.image ?? article.author.avatar;

  return (
    <article>
      <header className="mx-auto max-w-3xl px-4 pt-12 text-center sm:px-6">
        <Link
          href={`/${article.category.slug}`}
          className="text-label text-primary"
        >
          {article.category.name}
        </Link>
        <h1 className="text-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-body mt-4 text-lg">{article.excerpt}</p>
        )}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href={`/authors/${article.author.username}`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              {authorImage ? (
                <Image
                  src={authorImage}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  {(article.author.name ?? article.author.username).charAt(0)}
                </div>
              )}
              <span className="font-medium">
                {article.author.name ?? article.author.username}
              </span>
            </Link>
            <span>·</span>
            <time dateTime={article.publishedAt?.toISOString()}>
              {article.publishedAt ? formatDate(article.publishedAt) : ""}
            </time>
            <span>·</span>
            <span>{article.readingTime} min read</span>
          </div>
          <ShareButtons title={article.title} url={shareUrl} />
        </div>
        <div className="mt-4 flex justify-center">
          <ArticleEngagementBar
            articleId={article.id}
            slug={article.slug}
            initialLikes={engagement.likeCount}
            initialLiked={engagement.liked}
            initialBookmarked={engagement.bookmarked}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </header>

      {article.coverImage && (
        <div className="relative mx-auto mt-10 max-w-4xl px-4 sm:px-6 aspect-[16/9] max-h-[480px]">
          <Image
            src={article.coverImage}
            alt=""
            fill
            className="rounded-xl border border-border object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {article.aiSummary && (
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <p className="text-label text-primary">Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {article.aiSummary}
            </p>
          </div>
        </div>
      )}

      {(article.isSponsored || article.isAffiliate) && (
        <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
          <AffiliateDisclosure
            isSponsored={article.isSponsored}
            isAffiliate={article.isAffiliate}
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex gap-12">
          {headings.length > 0 && (
            <aside className="hidden w-56 shrink-0 xl:block">
              <ArticleToc headings={headings} />
              <AdSlot slot="sidebar" className="mt-8" />
            </aside>
          )}
          <div className="mx-auto min-w-0 max-w-3xl flex-1">
            <ArticleContent content={article.content} />
            <AdSlot slot="inArticle" className="my-8" />
          </div>
        </div>
      </div>

      {article.tags.length > 0 && (
        <div className="mx-auto flex max-w-3xl flex-wrap gap-2 px-4 pb-8 sm:px-6">
          {article.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <ArticleComments
        articleId={article.id}
        slug={article.slug}
        comments={comments}
        currentUserId={currentUserId}
        articleAuthorId={article.author.id}
        isLoggedIn={isLoggedIn}
      />

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-display mb-6 text-xl font-semibold">
              Related articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <p className="text-label text-primary">{a.category.name}</p>
                  <h3 className="text-display mt-2 font-semibold">{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

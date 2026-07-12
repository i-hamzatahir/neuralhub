import Link from "next/link";
import Image from "next/image";
import { ArticleContent } from "@/components/articles/article-content";
import { ArticleToc } from "@/components/articles/article-toc";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { ShareButtons } from "@/components/articles/share-buttons";
import { ArticleEngagementBar } from "@/components/engagement/article-engagement-bar";
import { ArticleComments } from "@/components/engagement/article-comments";
import { AdSlot } from "@/components/ads/ad-slot";
import { AffiliateDisclosure } from "@/components/articles/affiliate-disclosure";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { isPersonalSite } from "@/config/site-mode";
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
  const authorName = article.author.name ?? article.author.username;
  const published = article.publishedAt;
  const updated =
    article.updatedAt &&
    published &&
    article.updatedAt.getTime() > published.getTime()
      ? article.updatedAt
      : null;

  return (
    <article itemScope itemType="https://schema.org/Article">
      <div className="blog-container py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Articles", href: "/articles" },
            { name: article.category.name, href: `/${article.category.slug}` },
            { name: article.title },
          ]}
          className="mb-6"
        />

        <header className="max-w-3xl">
          <Link
            href={`/${article.category.slug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {article.category.name}
          </Link>
          <h1
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]"
            itemProp="headline"
          >
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground" itemProp="description">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div
              className="flex items-center gap-2"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <meta itemProp="name" content={authorName} />
              <Link
                href={`/authors/${article.author.username}`}
                className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
              >
                {authorImage ? (
                  <Image
                    src={authorImage}
                    alt={authorName}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                    {authorName.charAt(0)}
                  </div>
                )}
                <span>{authorName}</span>
              </Link>
            </div>
            {published && (
              <time dateTime={published.toISOString()} itemProp="datePublished">
                Published {formatDate(published)}
              </time>
            )}
            {updated && (
              <time dateTime={updated.toISOString()} itemProp="dateModified">
                Updated {formatDate(updated)}
              </time>
            )}
            <span>{article.readingTime} min read</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <ShareButtons title={article.title} url={shareUrl} />
            {!isPersonalSite && (
              <ArticleEngagementBar
                articleId={article.id}
                slug={article.slug}
                initialLikes={engagement.likeCount}
                initialLiked={engagement.liked}
                initialBookmarked={engagement.bookmarked}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        </header>

        {article.coverImage && (
          <div className="relative mx-auto mt-8 aspect-[16/9] max-h-[480px] max-w-4xl overflow-hidden rounded-lg bg-muted">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              itemProp="image"
            />
          </div>
        )}

        {article.aiSummary && (
          <aside className="mx-auto mt-8 max-w-3xl rounded-lg border border-border bg-muted/40 p-5">
            <h2 className="text-sm font-semibold text-foreground">Summary</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {article.aiSummary}
            </p>
          </aside>
        )}

        {(article.isSponsored || article.isAffiliate) && (
          <div className="mx-auto mt-6 max-w-3xl">
            <AffiliateDisclosure
              isSponsored={article.isSponsored}
              isAffiliate={article.isAffiliate}
            />
          </div>
        )}

        <div className="mt-10 flex gap-10">
          {headings.length > 0 && (
            <aside className="hidden w-56 shrink-0 xl:block">
              <nav aria-label="Table of contents">
                <ArticleToc headings={headings} />
              </nav>
              <AdSlot slot="sidebar" className="mt-8" />
            </aside>
          )}
          <div className="min-w-0 max-w-3xl flex-1" itemProp="articleBody">
            <ArticleContent content={article.content} />
            <AdSlot slot="inArticle" className="my-8" />
          </div>
        </div>

        {article.tags.length > 0 && (
          <footer className="mx-auto mt-8 max-w-3xl">
            <h2 className="text-sm font-semibold text-foreground">Tags</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/search?q=${encodeURIComponent(tag.name)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  rel="tag"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </footer>
        )}
      </div>

      {!isPersonalSite && (
        <ArticleComments
          articleId={article.id}
          slug={article.slug}
          comments={comments}
          currentUserId={currentUserId}
          articleAuthorId={article.author.id}
          isLoggedIn={isLoggedIn}
        />
      )}

      {related.length > 0 && (
        <section
          className="border-t border-border bg-muted/30 py-12"
          aria-labelledby="related-articles"
        >
          <div className="blog-container">
            <h2 id="related-articles" className="text-xl font-bold tracking-tight">
              Related articles
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              More from {article.category.name}
            </p>
            <div className="mt-6">
              {related.map((item) => (
                <ArticleListItem key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

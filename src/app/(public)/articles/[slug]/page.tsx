import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles/article.service";
import {
  getArticleEngagementStats,
  listArticleComments,
} from "@/lib/services/engagement/engagement.service";
import {
  buildArticleMetadata,
  buildArticleJsonLd,
} from "@/lib/seo/article-metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { resolveAbsoluteUrl } from "@/lib/seo/metadata";
import { extractHeadingsFromContent } from "@/lib/utils/tiptap-headings";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { ArticleReader } from "@/components/articles/article-reader";
import { ReadingProgress } from "@/components/articles/reading-progress";
import { ArticleViewTracker } from "@/components/articles/article-view-tracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return buildArticleMetadata(article);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const [related, headings, engagement, comments] = await Promise.all([
    getRelatedArticles(article.id, article.categoryId),
    Promise.resolve(extractHeadingsFromContent(article.content)),
    getArticleEngagementStats(article.id, userId),
    listArticleComments(article.id),
  ]);

  const shareUrl = resolveAbsoluteUrl(`/articles/${article.slug}`);

  const jsonLd = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Articles", path: "/articles" },
      { name: article.category.name, path: `/${article.category.slug}` },
      { name: article.title, path: `/articles/${article.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <ReadingProgress />
      <ArticleViewTracker articleId={article.id} />
      <ArticleReader
        article={article}
        related={related}
        headings={headings}
        shareUrl={shareUrl}
        engagement={engagement}
        comments={comments}
        currentUserId={userId}
        isLoggedIn={!!session?.user}
      />
    </>
  );
}

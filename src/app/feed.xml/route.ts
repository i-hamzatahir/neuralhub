import { listPublishedArticlesForFeed } from "@/lib/services/articles/article.service";
import { buildRssFeed } from "@/lib/seo/rss";

export const revalidate = 3600;

export async function GET() {
  const articles = await listPublishedArticlesForFeed(50);
  const feed = buildRssFeed(articles);

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

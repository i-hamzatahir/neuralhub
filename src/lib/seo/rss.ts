import { siteConfig } from "@/config/site";
import { resolveAbsoluteUrl } from "@/lib/seo/metadata";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatRssDate(date: Date): string {
  return date.toUTCString();
}

export function buildRssFeed(
  articles: {
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    author: { name: string | null; username: string };
    category: { name: string };
  }[],
): string {
  const feedUrl = resolveAbsoluteUrl("/feed.xml");
  const siteUrl = siteConfig.url;
  const buildDate = formatRssDate(new Date());

  const items = articles
    .map((article) => {
      const link = resolveAbsoluteUrl(`/articles/${article.slug}`);
      const pubDate = formatRssDate(article.publishedAt ?? article.updatedAt);
      const authorName = article.author.name ?? article.author.username;
      const description = article.excerpt ?? "";

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorName)}</author>
      <category>${escapeXml(article.category.name)}</category>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

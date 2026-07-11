import type { MetadataRoute } from "next";
import { topicNav } from "@/config/nav";
import {
  getCategories,
  listAuthorsForSitemap,
  listPublishedArticleSlugs,
} from "@/lib/services/articles/article.service";
import { resolveAbsoluteUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors] = await Promise.all([
    listPublishedArticleSlugs(),
    getCategories(),
    listAuthorsForSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: resolveAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: resolveAbsoluteUrl("/articles"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: resolveAbsoluteUrl("/authors"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: resolveAbsoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: resolveAbsoluteUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveAbsoluteUrl("/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: resolveAbsoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: resolveAbsoluteUrl("/write"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: resolveAbsoluteUrl("/search"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: resolveAbsoluteUrl("/newsletter"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: resolveAbsoluteUrl("/community"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveAbsoluteUrl("/tools"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveAbsoluteUrl("/resources"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveAbsoluteUrl("/projects"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveAbsoluteUrl("/feed.xml"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = topicNav.map((topic) => ({
    url: resolveAbsoluteUrl(topic.href),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const dbCategoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: resolveAbsoluteUrl(`/${category.slug}`),
    lastModified: category.createdAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: resolveAbsoluteUrl(`/articles/${article.slug}`),
    lastModified: article.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: resolveAbsoluteUrl(`/authors/${author.username}`),
    lastModified: author.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const seen = new Set<string>();
  const allPages = [
    ...staticPages,
    ...categoryPages,
    ...dbCategoryPages,
    ...articlePages,
    ...authorPages,
  ].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return allPages;
}

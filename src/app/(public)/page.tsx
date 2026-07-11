import {
  getCategories,
  listFeaturedAuthors,
  listPublishedArticles,
  listTrendingArticles,
} from "@/lib/services/articles/article.service";
import { HomeContent } from "@/components/home/home-content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const [featured, latest, trending, categories, authors] = await Promise.all([
    listPublishedArticles({ featured: true, limit: 1 }),
    listPublishedArticles({ limit: 6 }),
    listTrendingArticles(4),
    getCategories(),
    listFeaturedAuthors(6),
  ]);

  return (
    <>
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: siteConfig.name,
          description: siteConfig.description,
          path: "/",
        })}
      />
      <HomeContent
        featuredArticle={featured.articles[0] ?? null}
        latestArticles={latest.articles}
        trendingArticles={trending.articles}
        categories={categories}
        featuredAuthors={authors}
      />
    </>
  );
}

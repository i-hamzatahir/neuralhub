import {
  getCategories,
  listCategorySectionPreviews,
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
  title: `${siteConfig.name} | AI, Data Science & Technology Blog`,
  description: `${siteConfig.description} Browse latest and most-viewed articles on AI, machine learning, data science, programming, cloud computing, and developer tools.`,
  path: "/",
  keywords: [...siteConfig.keywords],
});

export default async function HomePage() {
  const [featured, latest, popular, categories, categorySections] =
    await Promise.all([
      listPublishedArticles({ featured: true, limit: 1 }),
      listPublishedArticles({ limit: 8 }),
      listTrendingArticles(5),
      getCategories(),
      listCategorySectionPreviews(4),
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
        popularArticles={popular.articles}
        categorySections={categorySections}
        categories={categories}
      />
    </>
  );
}

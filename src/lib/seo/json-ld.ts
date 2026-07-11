import { siteConfig } from "@/config/site";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";
import { resolveAbsoluteUrl, resolveImageUrl } from "@/lib/seo/metadata";

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: resolveImageUrl(siteConfig.ogImage),
    sameAs: [siteConfig.links.twitter, siteConfig.links.github].filter(Boolean),
  };
}

export function buildArticleJsonLd(article: ArticleWithRelations) {
  const url = resolveAbsoluteUrl(`/articles/${article.slug}`);
  const image = resolveImageUrl(
    article.ogImage || article.coverImage || siteConfig.ogImage,
  );

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt ?? article.seoDescription,
    image,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    wordCount: article.content.length,
    articleSection: article.category.name,
    keywords: article.tags.map(({ tag }) => tag.name).join(", "),
    author: {
      "@type": "Person",
      name: article.author.name ?? article.author.username,
      url: resolveAbsoluteUrl(`/authors/${article.author.username}`),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: resolveImageUrl(siteConfig.ogImage),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

export function buildPersonJsonLd(author: {
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  avatar: string | null;
}) {
  const name = author.name ?? author.username;
  const image = author.image ?? author.avatar;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: resolveAbsoluteUrl(`/authors/${author.username}`),
    ...(author.bio && { description: author.bio }),
    ...(image && { image: resolveImageUrl(image) }),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: resolveAbsoluteUrl(item.path),
    })),
  };
}

export function buildCollectionPageJsonLd(options: {
  name: string;
  description?: string | null;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description ?? siteConfig.description,
    url: resolveAbsoluteUrl(options.path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

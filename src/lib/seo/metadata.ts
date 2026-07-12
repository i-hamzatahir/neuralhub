import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

export interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  canonical?: string | null;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  section?: string;
  tags?: string[];
}

export function resolveAbsoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function resolveImageUrl(image?: string | null): string {
  if (!image) return resolveAbsoluteUrl(siteConfig.ogImage);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return resolveAbsoluteUrl(image);
}

function buildRobots(noIndex: boolean): Metadata["robots"] {
  if (noIndex) {
    return { index: false, follow: false };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description = siteConfig.description,
    path = "/",
    canonical,
    image,
    noIndex = false,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    keywords,
    section,
    tags,
  } = options;

  const url = resolveAbsoluteUrl(path);
  const canonicalUrl = canonical ?? url;
  const ogImage = resolveImageUrl(image);

  const openGraphType =
    type === "article" ? "article" : type === "profile" ? "profile" : "website";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: openGraphType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && publishedTime && { publishedTime }),
      ...(type === "article" && modifiedTime && { modifiedTime }),
      ...(type === "article" && authors && { authors }),
      ...(type === "article" && section && { section }),
      ...(type === "article" && tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      ...(siteConfig.twitterHandle && {
        site: siteConfig.twitterHandle,
        creator: siteConfig.twitterHandle,
      }),
    },
    robots: buildRobots(noIndex),
  };
}

export function buildArticleMetadata(article: ArticleWithRelations): Metadata {
  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.excerpt || siteConfig.description;
  const path = `/articles/${article.slug}`;
  const image = article.ogImage || article.coverImage;
  const tags = article.tags.map(({ tag }) => tag.name);

  return buildPageMetadata({
    title,
    description,
    path,
    canonical: article.canonicalUrl,
    image,
    type: "article",
    publishedTime: article.publishedAt?.toISOString(),
    modifiedTime: article.updatedAt.toISOString(),
    authors: [article.author.name ?? article.author.username],
    keywords: tags.length > 0 ? tags : undefined,
    section: article.category.name,
    tags,
  });
}

export function buildRootMetadata(): Metadata {
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    keywords: [...siteConfig.keywords],
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/logo.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
      shortcut: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
      images: [
        {
          url: resolveImageUrl(siteConfig.ogImage),
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [resolveImageUrl(siteConfig.ogImage)],
      ...(siteConfig.twitterHandle && { site: siteConfig.twitterHandle }),
    },
    alternates: {
      canonical: siteConfig.url,
      types: {
        "application/rss+xml": [
          { url: "/feed.xml", title: `${siteConfig.name} RSS Feed` },
        ],
      },
    },
    robots: buildRobots(false),
    ...(googleVerification && {
      verification: {
        google: googleVerification,
      },
    }),
  };
}

export const privateRouteMetadata: Metadata = {
  robots: buildRobots(true),
};

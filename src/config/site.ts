import { getAppUrl } from "@/lib/url";

export const siteConfig = {
  name: "NeuralHub",
  description:
    "Personal blog and knowledge site on artificial intelligence, machine learning, data science, programming, and emerging technology.",
  url: getAppUrl(),
  locale: "en_US",
  ogImage: "/opengraph-image",
  logo: "/logo.png",
  keywords: [
    "AI",
    "artificial intelligence",
    "machine learning",
    "data science",
    "programming",
    "research",
    "technology",
    "tutorials",
  ],
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? undefined,
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@neuralhub.blog",
  legal: {
    lastUpdated: "July 13, 2026",
    jurisdiction: "Pakistan",
  },
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;

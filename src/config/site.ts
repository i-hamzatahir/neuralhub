import { getAppUrl } from "@/lib/url";

export const siteConfig = {
  name: "NeuralHub",
  description:
    "Expert articles, tutorials, and guides on artificial intelligence, machine learning, data science, programming, and technology research.",
  url: getAppUrl(),
  locale: "en_US",
  ogImage: "/opengraph-image",
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
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;

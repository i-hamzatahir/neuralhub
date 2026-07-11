export const siteConfig = {
  name: "NeuralHub",
  description:
    "A premium knowledge platform for AI, Data Science, Machine Learning, Programming, and Research.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
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

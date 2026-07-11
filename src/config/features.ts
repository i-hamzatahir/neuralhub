export const featureFlags = {
  ai: process.env.AI_ENABLED === "true",
  aiProvider: (process.env.AI_PROVIDER ?? "none") as "none" | "openai",
  ads: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
} as const;

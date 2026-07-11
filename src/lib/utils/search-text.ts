import { extractTextFromTipTap } from "@/lib/utils/reading-time";

export function buildArticleSearchText(article: {
  title: string;
  excerpt?: string | null;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
}): string {
  const parts = [
    article.title,
    article.seoTitle,
    article.excerpt,
    article.seoDescription,
    extractTextFromTipTap(article.content),
  ].filter((part): part is string => Boolean(part?.trim()));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

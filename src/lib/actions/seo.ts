"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getAiProvider, isAiEnabled } from "@/lib/services/ai/ai.service";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";
import { slugify } from "@/lib/utils/slug";
import type { SeoSuggestions } from "@/lib/seo/analyzer";

export type SeoAiResult = {
  success: boolean;
  error?: string;
  suggestions?: SeoSuggestions;
};

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

export async function aiEnhanceSeoAction(input: {
  title: string;
  content: string;
  categoryId?: string;
}): Promise<SeoAiResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "ai-seo", 8, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many SEO AI requests. Try again later." };
  }

  if (!isAiEnabled()) {
    return {
      success: false,
      error: "Enable AI_ENABLED=true and OPENAI_API_KEY for AI SEO.",
    };
  }

  const provider = getAiProvider();
  if (!provider) {
    return { success: false, error: "No AI provider configured" };
  }

  const text = extractTextFromTipTap(input.content);
  if (!text.trim()) {
    return { success: false, error: "Add article content first" };
  }

  try {
    const [seoTitle, seoDescription, tags] = await Promise.all([
      provider.suggestSeoTitle(input.title || "Untitled", text),
      provider.suggestSeoDescription(input.title || "Untitled", text),
      provider.suggestTags(input.title || "Untitled", text),
    ]);

    return {
      success: true,
      suggestions: {
        seoTitle,
        seoDescription,
        excerpt: seoDescription,
        tags: tags.join(", "),
        slug: slugify(input.title),
        focusKeyword: tags[0],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI SEO request failed",
    };
  }
}

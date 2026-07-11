"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getAiProvider, isAiEnabled } from "@/lib/services/ai/ai.service";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";

export type AiActionResult = {
  success: boolean;
  error?: string;
  result?: string;
};

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

async function checkAiRateLimit(): Promise<AiActionResult | null> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "ai-request", 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many AI requests. Try again later." };
  }
  return null;
}

export async function aiSuggestTitleAction(
  content: string,
): Promise<AiActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const rateLimited = await checkAiRateLimit();
  if (rateLimited) return rateLimited;

  if (!isAiEnabled()) {
    return { success: false, error: "AI features are disabled" };
  }

  const provider = getAiProvider();
  if (!provider) {
    return { success: false, error: "No AI provider configured" };
  }

  try {
    const text = extractTextFromTipTap(content);
    if (!text.trim()) {
      return { success: false, error: "Add some content first" };
    }

    const result = await provider.suggestTitle(text);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI request failed",
    };
  }
}

export async function aiSuggestExcerptAction(
  title: string,
  content: string,
): Promise<AiActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const rateLimited = await checkAiRateLimit();
  if (rateLimited) return rateLimited;

  if (!isAiEnabled()) {
    return { success: false, error: "AI features are disabled" };
  }

  const provider = getAiProvider();
  if (!provider) {
    return { success: false, error: "No AI provider configured" };
  }

  try {
    const text = extractTextFromTipTap(content);
    if (!text.trim()) {
      return { success: false, error: "Add some content first" };
    }

    const result = await provider.suggestExcerpt(title || "Untitled", text);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI request failed",
    };
  }
}

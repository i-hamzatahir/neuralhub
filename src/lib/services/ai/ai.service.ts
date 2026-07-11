import { featureFlags } from "@/config/features";
import type { AiProvider, AiProviderName } from "@/lib/services/ai/types";
import { noneAiProvider } from "@/lib/services/ai/providers/none";
import { openAiProvider } from "@/lib/services/ai/providers/openai";

const providers: Record<AiProviderName, AiProvider> = {
  none: noneAiProvider,
  openai: openAiProvider,
};

export function getAiProviderName(): AiProviderName {
  const name = (process.env.AI_PROVIDER ?? "none") as AiProviderName;
  return name in providers ? name : "none";
}

export function isAiEnabled(): boolean {
  return featureFlags.ai && getAiProviderName() !== "none";
}

export function getAiProvider(): AiProvider | null {
  if (!isAiEnabled()) return null;
  return providers[getAiProviderName()];
}

export async function generateArticleSummary(
  title: string,
  contentText: string,
): Promise<string | null> {
  const provider = getAiProvider();
  if (!provider) return null;

  const summary = await provider.summarize(
    `Title: ${title}\n\n${contentText}`.trim(),
  );
  return summary || null;
}

export async function generateArticleEmbedding(
  text: string,
): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !isAiEnabled()) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      data?: { embedding?: number[] }[];
    };
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

export async function suggestArticleTags(
  title: string,
  contentText: string,
): Promise<string[]> {
  const provider = getAiProvider();
  if (!provider) return [];
  try {
    return await provider.suggestTags(title, contentText);
  } catch {
    return [];
  }
}

import type { AiProvider } from "@/lib/services/ai/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function chatCompletion(
  system: string,
  user: string,
  maxTokens = 300,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 12000) },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export const openAiProvider: AiProvider = {
  async summarize(text) {
    return chatCompletion(
      "You summarize technical articles concisely for a knowledge platform. Return 2-3 sentences only, no markdown.",
      text,
      200,
    );
  },

  async suggestExcerpt(title, content) {
    return chatCompletion(
      "Write a compelling article excerpt (max 160 characters) for a tech blog. Return only the excerpt text, no quotes.",
      `Title: ${title}\n\nContent:\n${content}`,
      80,
    );
  },

  async suggestTitle(content) {
    return chatCompletion(
      "Suggest one clear, engaging article title for a tech knowledge platform. Return only the title, no quotes.",
      content,
      40,
    );
  },

  async suggestTags(title, content) {
    const raw = await chatCompletion(
      "Suggest 3-5 lowercase tags for a tech article. Return comma-separated tags only, no hashtags.",
      `Title: ${title}\n\nContent:\n${content}`,
      60,
    );
    return raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
  },

  async suggestSeoTitle(title, content) {
    return chatCompletion(
      "Write one SEO title for a technical blog article. Max 60 characters. Include the main keyword early. Return only the title text.",
      `Article title: ${title}\n\nContent:\n${content}`,
      40,
    );
  },

  async suggestSeoDescription(title, content) {
    return chatCompletion(
      "Write one SEO meta description for a technical blog article. 140-160 characters. Compelling, specific, no quotes. Return only the description.",
      `Article title: ${title}\n\nContent:\n${content}`,
      80,
    );
  },
};

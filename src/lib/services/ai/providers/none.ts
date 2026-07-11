import type { AiProvider } from "@/lib/services/ai/types";

export const noneAiProvider: AiProvider = {
  async summarize() {
    return "";
  },
  async suggestExcerpt() {
    return "";
  },
  async suggestTitle() {
    return "";
  },
  async suggestTags() {
    return [];
  },
};

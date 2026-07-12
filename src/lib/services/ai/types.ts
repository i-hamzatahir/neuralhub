export interface AiProvider {
  summarize(text: string): Promise<string>;
  suggestExcerpt(title: string, content: string): Promise<string>;
  suggestTitle(content: string): Promise<string>;
  suggestTags(title: string, content: string): Promise<string[]>;
  suggestSeoTitle(title: string, content: string): Promise<string>;
  suggestSeoDescription(title: string, content: string): Promise<string>;
}

export type AiProviderName = "none" | "openai";

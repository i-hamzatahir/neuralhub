function trimToLength(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 20 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

export interface SocialShareKitInput {
  title: string;
  excerpt: string;
  slug: string;
  appUrl: string;
}

export interface SocialShareKit {
  url: string;
  twitter: string;
  linkedin: string;
  newsletter: string;
}

export function buildSocialShareKit(input: SocialShareKitInput): SocialShareKit {
  const title = input.title.trim() || "New article";
  const excerpt =
    input.excerpt.trim() ||
    "A new article is live on NeuralHub — dive in for the full write-up.";
  const slug = input.slug.trim() || "article";
  const baseUrl = input.appUrl.replace(/\/$/, "");
  const url = `${baseUrl}/articles/${slug}`;

  const twitterBody = trimToLength(`${title} ${url}`, 280);
  const linkedin = [
    title,
    "",
    trimToLength(excerpt, 300),
    "",
    `Read the full article: ${url}`,
  ].join("\n");

  const newsletter = [
    `New on NeuralHub: ${title}`,
    "",
    trimToLength(excerpt, 400),
    "",
    `→ ${url}`,
  ].join("\n");

  return { url, twitter: twitterBody, linkedin, newsletter };
}

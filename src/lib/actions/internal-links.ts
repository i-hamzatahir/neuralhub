"use server";

import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { prisma } from "@/lib/db/prisma";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";

export interface InternalLinkSuggestion {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  reason: string;
  markdown: string;
}

export type InternalLinksActionResult = {
  success: boolean;
  error?: string;
  suggestions?: InternalLinkSuggestion[];
};

function extractLinkedSlugs(content: string): Set<string> {
  const slugs = new Set<string>();
  const text = extractTextFromTipTap(content);
  const matches = text.matchAll(/\/articles\/([a-z0-9-]+)/gi);
  for (const match of matches) {
    if (match[1]) slugs.add(match[1].toLowerCase());
  }

  try {
    const doc = JSON.parse(content) as {
      content?: {
        marks?: { type?: string; attrs?: { href?: string } }[];
        content?: unknown[];
      }[];
    };

    function walk(nodes: typeof doc.content) {
      nodes?.forEach((node) => {
        const href = node.marks?.find((mark) => mark.type === "link")?.attrs?.href;
        if (href) {
          const slugMatch = href.match(/\/articles\/([a-z0-9-]+)/i);
          if (slugMatch?.[1]) slugs.add(slugMatch[1].toLowerCase());
        }
        walk(node.content as typeof doc.content);
      });
    }

    walk(doc.content);
  } catch {
    // ignore invalid JSON
  }

  return slugs;
}

function buildSearchTerms(title: string, tags: string): string[] {
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "your", "about",
    "into", "what", "when", "how", "why", "are", "was", "were", "have", "has",
  ]);

  const titleTerms = title
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const tagTerms = tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([...tagTerms, ...titleTerms])].slice(0, 8);
}

export async function suggestInternalLinksAction(input: {
  articleId?: string;
  title: string;
  tags: string;
  content: string;
}): Promise<InternalLinksActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const terms = buildSearchTerms(input.title, input.tags);
  if (!terms.length && !input.title.trim()) {
    return { success: true, suggestions: [] };
  }

  const linkedSlugs = extractLinkedSlugs(input.content);

  const articles = await prisma.article.findMany({
    where: {
      authorId: session.user.id,
      status: "PUBLISHED",
      ...(input.articleId ? { id: { not: input.articleId } } : {}),
      ...(terms.length
        ? {
            OR: [
              ...terms.map((term) => ({
                title: { contains: term, mode: "insensitive" as const },
              })),
              ...terms.map((term) => ({
                tags: {
                  some: { tag: { name: { contains: term, mode: "insensitive" as const } } },
                },
              })),
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { viewCount: "desc" },
    take: 12,
  });

  const suggestions = articles
    .filter((article) => !linkedSlugs.has(article.slug.toLowerCase()))
    .slice(0, 6)
    .map((article) => {
      const matchedTag = article.tags.find((entry) =>
        terms.some((term) => entry.tag.name.toLowerCase().includes(term)),
      );
      const reason = matchedTag
        ? `Shares tag “${matchedTag.tag.name}”`
        : "Related topic on your blog";

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        reason,
        markdown: `[${article.title}](/articles/${article.slug})`,
      };
    });

  return { success: true, suggestions };
}

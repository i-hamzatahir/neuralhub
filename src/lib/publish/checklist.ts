import {
  analyzeArticleSeo,
  type SeoAnalysisInput,
} from "@/lib/seo/analyzer";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";

export type PublishCheckSeverity = "required" | "recommended";

export interface PublishCheck {
  id: string;
  label: string;
  passed: boolean;
  message: string;
  severity: PublishCheckSeverity;
}

export interface PublishReadinessInput extends SeoAnalysisInput {
  slug: string;
}

export interface PublishReadinessResult {
  score: number;
  ready: boolean;
  seoScore: number;
  checks: PublishCheck[];
}

interface TipTapNode {
  type?: string;
  text?: string;
  marks?: { type?: string; attrs?: { href?: string } }[];
  content?: TipTapNode[];
}

export function countInternalLinks(content: string): number {
  let count = 0;

  function walk(node: TipTapNode) {
    if (node.type === "text" && node.marks?.length) {
      const href = node.marks.find((mark) => mark.type === "link")?.attrs?.href;
      if (href && (href.includes("/articles/") || href.includes("neuralhub.blog"))) {
        count += 1;
      }
    }
    node.content?.forEach(walk);
  }

  try {
    walk(JSON.parse(content) as TipTapNode);
  } catch {
    // ignore invalid JSON
  }

  return count;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzePublishReadiness(
  input: PublishReadinessInput,
): PublishReadinessResult {
  const seo = analyzeArticleSeo(input);
  const plainText = extractTextFromTipTap(input.content);
  const wordCount = countWords(plainText);
  const internalLinks = countInternalLinks(input.content);
  const hasSources = /\b(sources|further reading|references)\b/i.test(plainText);
  const excerpt = input.excerpt.trim();
  const metaDescription = (input.seoDescription || excerpt).trim();

  const checks: PublishCheck[] = [
    {
      id: "title",
      label: "Title",
      passed: input.title.trim().length >= 10,
      message:
        input.title.trim().length >= 10
          ? "Title is descriptive enough."
          : "Add a clear title (at least 10 characters).",
      severity: "required",
    },
    {
      id: "slug",
      label: "URL slug",
      passed: input.slug.trim().length >= 3,
      message: input.slug.trim()
        ? "Slug is set."
        : "Set a URL slug before publishing.",
      severity: "required",
    },
    {
      id: "content-length",
      label: "Article length",
      passed: wordCount >= 300,
      message:
        wordCount >= 300
          ? `${wordCount} words — good depth for SEO.`
          : `Only ${wordCount} words — aim for at least 300.`,
      severity: "required",
    },
    {
      id: "excerpt",
      label: "Excerpt",
      passed: excerpt.length >= 50,
      message:
        excerpt.length >= 50
          ? "Excerpt is ready for cards and search."
          : "Write an excerpt (50+ characters) for search and social previews.",
      severity: "required",
    },
    {
      id: "cover-image",
      label: "Cover image",
      passed: Boolean(input.coverImage.trim()),
      message: input.coverImage.trim()
        ? "Cover image is set."
        : "Add a cover image for homepage and social sharing.",
      severity: "recommended",
    },
    {
      id: "seo-score",
      label: "SEO score",
      passed: seo.score >= 70,
      message:
        seo.score >= 70
          ? `SEO score is ${seo.score}/100.`
          : `SEO score is ${seo.score}/100 — aim for 70+.`,
      severity: "required",
    },
    {
      id: "meta-description",
      label: "Meta description",
      passed: metaDescription.length >= 120 && metaDescription.length <= 165,
      message:
        metaDescription.length >= 120 && metaDescription.length <= 165
          ? "Meta description length is in range."
          : "Set SEO description to 120–160 characters.",
      severity: "recommended",
    },
    {
      id: "internal-links",
      label: "Internal links",
      passed: internalLinks >= 2,
      message:
        internalLinks >= 2
          ? `${internalLinks} internal links found.`
          : `Only ${internalLinks} internal link(s) — add 2+ to related posts.`,
      severity: "recommended",
    },
    {
      id: "sources",
      label: "Sources section",
      passed: hasSources,
      message: hasSources
        ? "Sources or references section detected."
        : "Add a Sources or Further reading section when using external material.",
      severity: "recommended",
    },
    {
      id: "category",
      label: "Category",
      passed: Boolean(input.categoryId),
      message: input.categoryId
        ? "Category is assigned."
        : "Choose a category.",
      severity: "required",
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const requiredChecks = checks.filter((check) => check.severity === "required");
  const ready = requiredChecks.every((check) => check.passed);

  return {
    score: Math.round((passedCount / checks.length) * 100),
    ready,
    seoScore: seo.score,
    checks,
  };
}

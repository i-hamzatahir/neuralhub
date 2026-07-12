import { extractHeadingsFromContent } from "@/lib/utils/tiptap-headings";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";
import { slugify } from "@/lib/utils/slug";

export type SeoSeverity = "error" | "warning" | "good" | "info";

export interface SeoCheck {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  severity: SeoSeverity;
  message: string;
  tip: string;
}

export interface SeoSuggestions {
  title?: string;
  slug?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string;
  focusKeyword?: string;
}

export interface SeoAnalysisInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
}

export interface SeoAnalysisResult {
  score: number;
  grade: "Poor" | "Fair" | "Good" | "Excellent";
  checks: SeoCheck[];
  suggestions: SeoSuggestions;
  metaPreview: {
    title: string;
    description: string;
    urlSlug: string;
  };
}

interface TipTapNode {
  type?: string;
  text?: string;
  marks?: { type?: string; attrs?: { href?: string } }[];
  content?: TipTapNode[];
}

function trimMeta(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function parseContentStats(content: string) {
  let images = 0;
  let links = 0;
  let codeBlocks = 0;

  function walk(node: TipTapNode) {
    if (node.type === "image") images += 1;
    if (node.type === "codeBlock") codeBlocks += 1;
    if (node.type === "link" || node.marks?.some((mark) => mark.type === "link")) {
      links += 1;
    }
    node.content?.forEach(walk);
  }

  try {
    walk(JSON.parse(content) as TipTapNode);
  } catch {
    // ignore invalid editor JSON
  }

  return { images, links, codeBlocks };
}

function severityFromRatio(ratio: number): SeoSeverity {
  if (ratio >= 0.9) return "good";
  if (ratio >= 0.6) return "warning";
  return "error";
}

function addCheck(
  checks: SeoCheck[],
  check: Omit<SeoCheck, "severity"> & { severity?: SeoSeverity },
) {
  const ratio = check.maxScore > 0 ? check.score / check.maxScore : 0;
  checks.push({
    ...check,
    severity: check.severity ?? severityFromRatio(ratio),
  });
}

function gradeFromScore(score: number): SeoAnalysisResult["grade"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function suggestTagsFromTitle(title: string, existing: string): string {
  if (existing.trim()) return existing.trim();
  const words = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 4);
  return [...new Set(words)].join(", ");
}

function focusKeywordFromTitle(title: string): string {
  const words = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);
  return words.slice(0, 2).join(" ");
}

export function buildSeoSuggestions(input: SeoAnalysisInput): SeoSuggestions {
  const plainText = extractTextFromTipTap(input.content);
  const keyword = focusKeywordFromTitle(input.title);

  return {
    title: input.title.trim() || undefined,
    slug: input.slug.trim() || slugify(input.title) || undefined,
    excerpt:
      input.excerpt.trim() ||
      (plainText ? trimMeta(plainText, 160) : undefined),
    seoTitle:
      input.seoTitle.trim() ||
      trimMeta(input.title.trim(), 60) ||
      undefined,
    seoDescription:
      input.seoDescription.trim() ||
      input.excerpt.trim() ||
      (plainText ? trimMeta(plainText, 155) : undefined),
    tags: suggestTagsFromTitle(input.title, input.tags),
    focusKeyword: keyword || undefined,
  };
}

export function analyzeArticleSeo(input: SeoAnalysisInput): SeoAnalysisResult {
  const checks: SeoCheck[] = [];
  const plainText = extractTextFromTipTap(input.content);
  const wordCount = countWords(plainText);
  const headings = extractHeadingsFromContent(input.content);
  const contentStats = parseContentStats(input.content);
  const suggestions = buildSeoSuggestions(input);

  const metaDescription =
    input.seoDescription.trim() || input.excerpt.trim() || suggestions.seoDescription || "";
  const metaTitle = input.seoTitle.trim() || input.title.trim();
  const slug = input.slug.trim() || suggestions.slug || "";
  const tagList = input.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // Title (12)
  {
    const len = input.title.trim().length;
    let score = 0;
    if (len >= 20 && len <= 70) score = 12;
    else if (len >= 10) score = 8;
    else if (len > 0) score = 4;
    addCheck(checks, {
      id: "title",
      label: "Article title",
      score,
      maxScore: 12,
      message:
        len === 0
          ? "Add a clear article title."
          : len < 20
            ? "Title is short — aim for 20–70 characters."
            : len > 70
              ? "Title is long — keep it concise for search results."
              : "Title length looks strong.",
      tip: "Use a specific benefit or outcome, e.g. “How to build a RAG pipeline in Python”.",
    });
  }

  // Slug (8)
  {
    let score = 0;
    if (slug.length >= 8 && slug.length <= 60 && slug === slugify(slug)) score = 8;
    else if (slug.length > 0) score = 5;
    addCheck(checks, {
      id: "slug",
      label: "URL slug",
      score,
      maxScore: 8,
      message:
        slug.length === 0
          ? "Generate a readable slug from the title."
          : slug !== slugify(slug)
            ? "Use lowercase words separated by hyphens only."
            : "Slug is readable and search-friendly.",
      tip: "Keep slugs short and keyword-focused, such as `rag-pipeline-python`.",
    });
  }

  // Meta description (15)
  {
    const len = metaDescription.length;
    let score = 0;
    if (len >= 120 && len <= 160) score = 15;
    else if (len >= 80) score = 10;
    else if (len > 0) score = 5;
    addCheck(checks, {
      id: "meta-description",
      label: "Meta description",
      score,
      maxScore: 15,
      message:
        len === 0
          ? "Add an excerpt or SEO description for Google snippets."
          : len < 120
            ? "Description is short — aim for 120–160 characters."
            : len > 160
              ? "Description may truncate in search results."
              : "Meta description length is ideal.",
      tip: "Summarize the reader outcome in one compelling sentence.",
    });
  }

  // SEO title (10)
  {
    const len = (input.seoTitle.trim() || input.title.trim()).length;
    let score = 0;
    if (input.seoTitle.trim() && len >= 45 && len <= 60) score = 10;
    else if (input.seoTitle.trim() && len >= 30) score = 7;
    else if (input.title.trim()) score = 4;
    addCheck(checks, {
      id: "seo-title",
      label: "SEO title",
      score,
      maxScore: 10,
      message: input.seoTitle.trim()
        ? "Custom SEO title is set."
        : "Add a dedicated SEO title for stronger search CTR.",
      tip: "Place the main keyword near the start of the SEO title.",
    });
  }

  // Content depth (15)
  {
    let score = 0;
    if (wordCount >= 1200) score = 15;
    else if (wordCount >= 800) score = 12;
    else if (wordCount >= 400) score = 8;
    else if (wordCount >= 150) score = 4;
    addCheck(checks, {
      id: "content-length",
      label: "Content depth",
      score,
      maxScore: 15,
      message:
        wordCount === 0
          ? "Write the article body before publishing."
          : wordCount < 400
            ? `About ${wordCount} words — long-form posts (800+) rank better.`
            : `About ${wordCount} words — solid depth for search.`,
      tip: "Add examples, steps, and FAQs to increase topical authority.",
    });
  }

  // Heading structure (10)
  {
    let score = 0;
    if (headings.length >= 3) score = 10;
    else if (headings.length >= 1) score = 6;
    addCheck(checks, {
      id: "headings",
      label: "Heading structure",
      score,
      maxScore: 10,
      message:
        headings.length === 0
          ? "Add H2/H3 headings to structure the article."
          : `${headings.length} subheading(s) found — good for scannability.`,
      tip: "Use one main idea per H2 section and related H3 subsections.",
    });
  }

  // Cover image (10)
  {
    const score = input.coverImage.trim() ? 10 : 0;
    addCheck(checks, {
      id: "cover-image",
      label: "Cover image",
      score,
      maxScore: 10,
      message: input.coverImage.trim()
        ? "Cover image is set for social and listing previews."
        : "Add a cover image to improve CTR on social and Google Discover.",
      tip: "Use a clean 1200×630 image with readable contrast.",
    });
  }

  // Tags (5)
  {
    let score = 0;
    if (tagList.length >= 3 && tagList.length <= 6) score = 5;
    else if (tagList.length >= 1) score = 3;
    addCheck(checks, {
      id: "tags",
      label: "Tags",
      score,
      maxScore: 5,
      message:
        tagList.length === 0
          ? "Add 3–5 topical tags."
          : `${tagList.length} tag(s) added.`,
      tip: "Use specific tags like `vector-search`, not vague ones like `tech`.",
    });
  }

  // Category (5)
  {
    const score = input.categoryId ? 5 : 0;
    addCheck(checks, {
      id: "category",
      label: "Category",
      score,
      maxScore: 5,
      message: input.categoryId
        ? "Category is assigned."
        : "Choose the best-fit category.",
      tip: "Category pages help Google understand topical focus.",
    });
  }

  // Media & links (8)
  {
    let score = 0;
    if (contentStats.images >= 1) score += 4;
    if (contentStats.links >= 2) score += 4;
    addCheck(checks, {
      id: "rich-content",
      label: "Images & links",
      score,
      maxScore: 8,
      message:
        score >= 6
          ? "Article includes helpful visuals and references."
          : "Add at least one image and a few relevant links.",
      tip: "Link to authoritative docs and 1–2 related articles on your site.",
    });
  }

  // Focus keyword usage (10)
  {
    const keyword = suggestions.focusKeyword ?? "";
    const haystack = `${input.title} ${slug} ${metaDescription} ${plainText.slice(0, 500)}`.toLowerCase();
    let score = 0;
    if (keyword && haystack.includes(keyword)) score = 10;
    else if (keyword && haystack.includes(keyword.split(" ")[0] ?? "")) score = 6;
    addCheck(checks, {
      id: "keyword",
      label: "Focus keyword",
      score,
      maxScore: 10,
      message: keyword
        ? score >= 6
          ? `Keyword “${keyword}” appears in key fields.`
          : `Use “${keyword}” in the title, slug, and opening section.`
        : "Add a stronger title to define a focus keyword.",
      tip: "Pick one primary phrase and repeat it naturally 3–5 times.",
    });
  }

  const score = Math.min(
    100,
    checks.reduce((sum, check) => sum + check.score, 0),
  );

  return {
    score,
    grade: gradeFromScore(score),
    checks,
    suggestions,
    metaPreview: {
      title: metaTitle || "Article title preview",
      description: metaDescription || "Meta description preview will appear here.",
      urlSlug: slug || "your-article-slug",
    },
  };
}

export function getChecksNeedingFix(result: SeoAnalysisResult): SeoCheck[] {
  return result.checks.filter((check) => check.score < check.maxScore * 0.8);
}

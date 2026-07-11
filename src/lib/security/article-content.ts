import { isSafeUrl } from "@/lib/security/link";
import { toSafeEmbedUrl } from "@/lib/security/embed-url";

type TipTapNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type?: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

function sanitizeNode(node: TipTapNode): TipTapNode | null {
  if (!node || typeof node !== "object") return null;

  const sanitized: TipTapNode = { ...node };

  if (node.type === "videoEmbed" && node.attrs?.src) {
    const safe = toSafeEmbedUrl(String(node.attrs.src));
    if (!safe) return null;
    sanitized.attrs = { ...node.attrs, src: safe };
  }

  if (node.type === "image" && node.attrs?.src) {
    const src = String(node.attrs.src);
    if (!isSafeUrl(src)) return null;
    sanitized.attrs = { ...node.attrs, src };
  }

  if (node.marks) {
    sanitized.marks = node.marks
      .map((mark) => {
        if (mark.type === "link" && mark.attrs?.href) {
          const href = String(mark.attrs.href);
          if (!isSafeUrl(href)) return null;
          return { ...mark, attrs: { ...mark.attrs, href } };
        }
        return mark;
      })
      .filter((mark): mark is NonNullable<typeof mark> => mark !== null);
  }

  if (node.content) {
    sanitized.content = node.content
      .map(sanitizeNode)
      .filter((child): child is TipTapNode => child !== null);
  }

  return sanitized;
}

export function sanitizeArticleContent(content: string): string {
  try {
    const doc = JSON.parse(content) as TipTapNode;
    if (doc.type !== "doc" || !Array.isArray(doc.content)) {
      throw new Error("Invalid article content");
    }
    const sanitized = sanitizeNode(doc);
    return JSON.stringify(sanitized ?? { type: "doc", content: [] });
  } catch {
    throw new Error("Invalid article content format");
  }
}

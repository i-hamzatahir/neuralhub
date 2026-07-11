import { slugify } from "@/lib/utils/slug";

export interface TocHeading {
  id: string;
  level: number;
  text: string;
}

interface TipTapNode {
  type?: string;
  attrs?: { level?: number; latex?: string; source?: string; markdown?: string };
  text?: string;
  content?: TipTapNode[];
}

function extractText(node: TipTapNode): string {
  if (node.type === "mathBlock" || node.type === "mathInline") {
    return node.attrs?.latex ?? "";
  }
  if (node.type === "mermaidBlock") {
    return node.attrs?.source ?? "";
  }
  if (node.type === "markdownBlock") {
    return node.attrs?.markdown ?? "";
  }
  if (node.text) return node.text;
  return node.content?.map(extractText).join("") ?? "";
}

function uniqueId(text: string, used: Set<string>): string {
  const base = slugify(text) || "section";
  let id = base;
  let counter = 2;
  while (used.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  used.add(id);
  return id;
}

export function extractHeadingsFromContent(content: string): TocHeading[] {
  try {
    const doc = JSON.parse(content) as TipTapNode;
    const headings: TocHeading[] = [];
    const usedIds = new Set<string>();

    function walk(node: TipTapNode) {
      if (node.type === "heading") {
        const level = node.attrs?.level ?? 2;
        if (level >= 2 && level <= 3) {
          const text = extractText(node).trim();
          if (text) {
            headings.push({
              id: uniqueId(text, usedIds),
              level,
              text,
            });
          }
        }
      }
      node.content?.forEach(walk);
    }

    walk(doc);
    return headings;
  } catch {
    return [];
  }
}

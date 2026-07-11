interface TipTapNode {
  type?: string;
  text?: string;
  attrs?: { latex?: string; source?: string; markdown?: string };
  content?: TipTapNode[];
}

export function extractTextFromTipTap(content: string): string {
  try {
    const doc = JSON.parse(content) as TipTapNode;
    return extractNodeText(doc);
  } catch {
    return content;
  }
}

function extractNodeText(node: TipTapNode): string {
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
  if (!node.content) return "";
  return node.content.map(extractNodeText).join(" ");
}

export function calculateReadingTime(content: string, wpm = 200): number {
  const text = extractTextFromTipTap(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}

export function extractExcerpt(content: string, maxLength = 160): string {
  const text = extractTextFromTipTap(content).trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

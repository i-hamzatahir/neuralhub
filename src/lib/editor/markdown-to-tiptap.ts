type TipTapMark = { type: string; attrs?: Record<string, unknown> };
type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

function textNode(text: string, marks?: TipTapMark[]): TipTapNode {
  if (!text) return { type: "text", text: "" };
  return marks?.length ? { type: "text", text, marks } : { type: "text", text };
}

function paragraph(content: TipTapNode[]): TipTapNode {
  return { type: "paragraph", content: content.length ? content : [textNode("")] };
}

function parseInline(text: string): TipTapNode[] {
  if (!text) return [textNode("")];

  const nodes: TipTapNode[] = [];
  const pattern =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_|`([^`]+)`/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(textNode(text.slice(lastIndex, match.index)));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      nodes.push(
        textNode(match[1], [{ type: "link", attrs: { href: match[2].trim() } }]),
      );
    } else if (match[3] !== undefined) {
      nodes.push(textNode(match[3], [{ type: "bold" }]));
    } else if (match[4] !== undefined) {
      nodes.push(textNode(match[4], [{ type: "italic" }]));
    } else if (match[5] !== undefined) {
      nodes.push(textNode(match[5], [{ type: "bold" }]));
    } else if (match[6] !== undefined) {
      nodes.push(textNode(match[6], [{ type: "italic" }]));
    } else if (match[7] !== undefined) {
      nodes.push(textNode(match[7], [{ type: "code" }]));
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(textNode(text.slice(lastIndex)));
  }

  return nodes.length ? nodes : [textNode(text)];
}

function parseListItem(text: string): TipTapNode {
  return {
    type: "listItem",
    content: [paragraph(parseInline(text))],
  };
}

function heading(level: number, text: string): TipTapNode {
  return {
    type: "heading",
    attrs: { level },
    content: parseInline(text),
  };
}

function codeBlock(code: string, language?: string): TipTapNode {
  return {
    type: "codeBlock",
    attrs: language ? { language } : {},
    content: [textNode(code)],
  };
}

function mermaidBlock(source: string): TipTapNode {
  return {
    type: "mermaidBlock",
    attrs: { source },
  };
}

function blockquote(lines: string[]): TipTapNode {
  return {
    type: "blockquote",
    content: lines.map((line) => paragraph(parseInline(line))),
  };
}

function imageBlock(src: string, alt: string): TipTapNode {
  return {
    type: "image",
    attrs: { src: src.trim(), alt: alt.trim() },
  };
}

const imageLinePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/;

export function markdownToTipTap(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const imageMatch = trimmed.match(imageLinePattern);
    if (imageMatch) {
      content.push(imageBlock(imageMatch[2], imageMatch[1]));
      i += 1;
      continue;
    }

    const codeFence = trimmed.match(/^```(\w+)?$/);
    if (codeFence) {
      const language = codeFence[1];
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      const code = codeLines.join("\n");
      if (language === "mermaid") {
        content.push(mermaidBlock(code));
      } else {
        content.push(codeBlock(code, language));
      }
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      content.push({ type: "horizontalRule" });
      i += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      content.push(heading(headingMatch[1].length, headingMatch[2].trim()));
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      content.push(blockquote(quoteLines));
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(parseListItem(lines[i].trim().replace(/^[-*+]\s+/, "")));
        i += 1;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseListItem(lines[i].trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !imageLinePattern.test(lines[i].trim()) &&
      !/^[-*+]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    content.push(paragraph(parseInline(paragraphLines.join(" "))));
  }

  if (!content.length) {
    return JSON.stringify({ type: "doc", content: [paragraph([textNode("")])] });
  }

  return JSON.stringify({ type: "doc", content });
}

"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { NodeViewWrapper } from "@tiptap/react";

interface MarkdownBlockViewProps {
  node: { attrs: { markdown?: string } };
  updateAttributes: (attrs: { markdown: string }) => void;
  editor: { isEditable: boolean };
}

export function MarkdownBlockView({
  node,
  updateAttributes,
  editor,
}: MarkdownBlockViewProps) {
  const markdown = node.attrs.markdown ?? "";
  const html = markdown.trim()
    ? DOMPurify.sanitize(
        marked.parse(markdown, { async: false }) as string,
        { USE_PROFILES: { html: true } },
      )
    : "";

  return (
    <NodeViewWrapper className="markdown-block my-4 rounded-lg border border-dashed border-border bg-muted/10 p-4">
      {editor.isEditable && (
        <textarea
          value={markdown}
          onChange={(e) => updateAttributes({ markdown: e.target.value })}
          className="mb-3 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-ring"
          placeholder="## Heading&#10;&#10;Markdown / MDX-style content…"
          rows={6}
        />
      )}
      {html ? (
        <div
          className="prose prose-zinc dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {editor.isEditable
            ? "Write Markdown above — supports headings, lists, links, and code."
            : ""}
        </p>
      )}
    </NodeViewWrapper>
  );
}

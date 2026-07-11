"use client";

import { useCallback } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathBlockViewProps {
  node: { attrs: { latex?: string } };
  updateAttributes: (attrs: { latex: string }) => void;
  editor: { isEditable: boolean };
}

export function MathBlockView({
  node,
  updateAttributes,
  editor,
}: MathBlockViewProps) {
  const latex = node.attrs.latex ?? "";

  const rendered = useCallback(() => {
    if (!latex.trim()) return "";
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return '<span class="text-destructive">Invalid LaTeX</span>';
    }
  }, [latex]);

  return (
    <NodeViewWrapper className="math-block my-4 rounded-lg border border-border bg-muted/20 p-4">
      {editor.isEditable && (
        <textarea
          value={latex}
          onChange={(e) => updateAttributes({ latex: e.target.value })}
          className="mb-3 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-ring"
          placeholder="E = mc^2"
          rows={3}
        />
      )}
      {latex.trim() ? (
        <div
          className="overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: rendered() }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Enter LaTeX above</p>
      )}
    </NodeViewWrapper>
  );
}

"use client";

import { useCallback } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathInlineViewProps {
  node: { attrs: { latex?: string } };
  updateAttributes: (attrs: { latex: string }) => void;
  editor: { isEditable: boolean };
}

export function MathInlineView({
  node,
  updateAttributes,
  editor,
}: MathInlineViewProps) {
  const latex = node.attrs.latex ?? "x";

  const rendered = useCallback(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return '<span class="text-destructive">?</span>';
    }
  }, [latex]);

  if (editor.isEditable) {
    return (
      <NodeViewWrapper as="span" className="math-inline inline">
        <input
          value={latex}
          onChange={(e) => updateAttributes({ latex: e.target.value })}
          className="mx-0.5 w-24 rounded border border-input bg-background px-1.5 py-0.5 font-mono text-xs focus-ring"
          placeholder="x^2"
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="math-inline inline">
      <span dangerouslySetInnerHTML={{ __html: rendered() }} />
    </NodeViewWrapper>
  );
}

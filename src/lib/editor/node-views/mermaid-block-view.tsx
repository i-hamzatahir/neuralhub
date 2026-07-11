"use client";

import { useEffect, useId, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import DOMPurify from "isomorphic-dompurify";
import mermaid from "mermaid";

let mermaidReady = false;

interface MermaidBlockViewProps {
  node: { attrs: { source?: string } };
  updateAttributes: (attrs: { source: string }) => void;
  editor: { isEditable: boolean };
}

export function MermaidBlockView({
  node,
  updateAttributes,
  editor,
}: MermaidBlockViewProps) {
  const source = node.attrs.source ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!containerRef.current || !source.trim()) {
      if (containerRef.current) containerRef.current.innerHTML = "";
      return;
    }

    if (!mermaidReady) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
      });
      mermaidReady = true;
    }

    let cancelled = false;

    mermaid
      .render(`mermaid-${renderId}`, source)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
          });
        }
      })
      .catch(() => {
        if (!cancelled && containerRef.current) {
          containerRef.current.textContent = "Invalid Mermaid diagram";
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source, renderId]);

  return (
    <NodeViewWrapper className="mermaid-block my-4 rounded-lg border border-border bg-card p-4">
      {editor.isEditable && (
        <textarea
          value={source}
          onChange={(e) => updateAttributes({ source: e.target.value })}
          className="mb-3 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-ring"
          placeholder={"graph TD\n  A[Start] --> B[End]"}
          rows={5}
        />
      )}
      <div
        ref={containerRef}
        className="flex justify-center overflow-x-auto [&_svg]:max-w-full"
      />
      {!source.trim() && editor.isEditable && (
        <p className="text-sm text-muted-foreground">Enter Mermaid syntax above</p>
      )}
    </NodeViewWrapper>
  );
}

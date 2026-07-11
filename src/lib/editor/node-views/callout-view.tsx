"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { cn } from "@/lib/utils/cn";

const styles = {
  info: "border-primary/30 bg-primary/5 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-foreground",
  success: "border-success/40 bg-success/10 text-foreground",
} as const;

interface CalloutViewProps {
  node: { attrs: { type?: keyof typeof styles } };
  updateAttributes: (attrs: { type: keyof typeof styles }) => void;
  editor: { isEditable: boolean };
}

export function CalloutView({
  node,
  updateAttributes,
  editor,
}: CalloutViewProps) {
  const type = node.attrs.type ?? "info";

  return (
    <NodeViewWrapper
      className={cn(
        "callout my-4 rounded-lg border-l-4 px-4 py-3",
        styles[type] ?? styles.info,
      )}
    >
      {editor.isEditable && (
        <select
          value={type}
          onChange={(e) =>
            updateAttributes({ type: e.target.value as keyof typeof styles })
          }
          className="mb-2 rounded border border-input bg-background px-2 py-0.5 text-xs"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
        </select>
      )}
      <NodeViewContent className="prose prose-zinc dark:prose-invert max-w-none text-sm" />
    </NodeViewWrapper>
  );
}

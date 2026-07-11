"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { toSafeEmbedUrl } from "@/lib/security/embed-url";

interface VideoEmbedViewProps {
  node: { attrs: { src?: string; title?: string } };
  updateAttributes: (attrs: { src: string; title?: string }) => void;
  editor: { isEditable: boolean };
}

export function VideoEmbedView({
  node,
  updateAttributes,
  editor,
}: VideoEmbedViewProps) {
  const src = node.attrs.src ?? "";
  const embedUrl = src ? toSafeEmbedUrl(src) : null;

  return (
    <NodeViewWrapper className="video-embed my-4">
      {editor.isEditable && (
        <input
          value={src}
          onChange={(e) => updateAttributes({ src: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-ring"
        />
      )}
      {embedUrl ? (
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
          <iframe
            src={embedUrl}
            title={node.attrs.title || "Video"}
            className="h-full w-full"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {editor.isEditable
            ? "Enter a YouTube or Vimeo URL above"
            : "Video unavailable"}
        </p>
      )}
    </NodeViewWrapper>
  );
}

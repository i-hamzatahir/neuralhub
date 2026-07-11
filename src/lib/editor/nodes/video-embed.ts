import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VideoEmbedView } from "@/lib/editor/node-views/video-embed-view";

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      title: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "video-embed" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },

  addCommands() {
    return {
      insertVideoEmbed:
        (attrs?: { src?: string }) =>
        ({ commands }) => {
          const src =
            attrs?.src ??
            window.prompt("Video URL (YouTube, Vimeo, or embed URL)") ??
            "";
          if (!src) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { src, title: "" },
          });
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      insertVideoEmbed: (attrs?: { src?: string }) => ReturnType;
    };
  }
}

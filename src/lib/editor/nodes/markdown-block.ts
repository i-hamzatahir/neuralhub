import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MarkdownBlockView } from "@/lib/editor/node-views/markdown-block-view";

export const MarkdownBlock = Node.create({
  name: "markdownBlock",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      markdown: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="markdown-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "markdown-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MarkdownBlockView);
  },

  addCommands() {
    return {
      insertMarkdownBlock:
        (attrs?: { markdown?: string }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { markdown: attrs?.markdown ?? "## Section\n\nYour content here." },
          }),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    markdownBlock: {
      insertMarkdownBlock: (attrs?: { markdown?: string }) => ReturnType;
    };
  }
}

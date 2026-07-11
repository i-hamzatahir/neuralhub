import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { mergeAttributes } from "@tiptap/core";
import { createLowlight } from "lowlight";
import { slugify } from "@/lib/utils/slug";
import { safeLinkConfig } from "@/lib/security/link";
import { MathBlock } from "@/lib/editor/nodes/math-block";
import { MathInline } from "@/lib/editor/nodes/math-inline";
import { MermaidBlock } from "@/lib/editor/nodes/mermaid-block";
import { MarkdownBlock } from "@/lib/editor/nodes/markdown-block";
import { Callout } from "@/lib/editor/nodes/callout";
import { VideoEmbed } from "@/lib/editor/nodes/video-embed";

const tableExtensions = [
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

const advancedNodes = [
  MathBlock,
  MathInline,
  MermaidBlock,
  MarkdownBlock,
  Callout,
  VideoEmbed,
];

const usedHeadingIds = new Set<string>();

function headingId(text: string): string {
  const base = slugify(text) || "section";
  let id = base;
  let counter = 2;
  while (usedHeadingIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  usedHeadingIds.add(id);
  return id;
}

export function resetHeadingIds() {
  usedHeadingIds.clear();
}

const HeadingWithId = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : this.options.levels[0];
    const id = headingId(node.textContent || "section");
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id }),
      0,
    ];
  },
});

export function getEditorExtensions({
  lowlight,
  placeholder = "Start writing your article…",
}: {
  lowlight: ReturnType<typeof createLowlight>;
  placeholder?: string;
}) {
  return [
    StarterKit.configure({ codeBlock: false }),
    Link.configure({ openOnClick: false, ...safeLinkConfig }),
    Image.configure({ inline: false }),
    Placeholder.configure({ placeholder }),
    Underline,
    CodeBlockLowlight.configure({ lowlight }),
    ...tableExtensions,
    ...advancedNodes,
  ];
}

export function getReaderExtensions({
  lowlight,
}: {
  lowlight: ReturnType<typeof createLowlight>;
}) {
  return [
    StarterKit.configure({ codeBlock: false, heading: false }),
    HeadingWithId.configure({ levels: [1, 2, 3, 4] }),
    Link.configure({ openOnClick: true, ...safeLinkConfig }),
    Image,
    CodeBlockLowlight.configure({ lowlight }),
    ...tableExtensions,
    ...advancedNodes,
  ];
}

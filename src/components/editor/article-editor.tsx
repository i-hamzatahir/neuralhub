"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Sigma,
  GitBranch,
  FileCode,
  Table,
  Info,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getEditorExtensions } from "@/lib/editor/extensions";
import { isSafeUrl } from "@/lib/security/link";

const lowlight = createLowlight(common);

interface ArticleEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export function ArticleEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = "Start writing your article…",
}: ArticleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getEditorExtensions({ lowlight, placeholder }),
    content: content ? JSON.parse(content) : undefined,
    onUpdate: ({ editor: e }) => {
      onChange(JSON.stringify(e.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (content && content !== current) {
      try {
        editor.commands.setContent(JSON.parse(content));
      } catch {
        /* ignore invalid JSON */
      }
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL");
    if (url && isSafeUrl(url)) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor || !onImageUpload) return;
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor, onImageUpload],
  );

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={Bold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={Italic}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={UnderlineIcon}
          label="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          icon={Strikethrough}
          label="Strikethrough"
        />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          label="H1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          label="H3"
        />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={List}
          label="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
          label="Ordered list"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={Quote}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={Code}
          label="Code block"
        />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertMathBlock().run()}
          icon={Sigma}
          label="Math block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertMathInline().run()}
          icon={Sigma}
          label="Inline math"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertMermaidBlock().run()}
          icon={GitBranch}
          label="Mermaid diagram"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertMarkdownBlock().run()}
          icon={FileCode}
          label="Markdown block"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          icon={Table}
          label="Table"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertCallout().run()}
          icon={Info}
          label="Callout"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().insertVideoEmbed().run()}
          icon={Video}
          label="Video"
        />
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} icon={LinkIcon} label="Link" />
        {onImageUpload && (
          <>
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              icon={ImageIcon}
              label="Image"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </>
        )}
        <div className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
          label="Redo"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(active && "bg-accent text-foreground")}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

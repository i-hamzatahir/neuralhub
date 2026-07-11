"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { getReaderExtensions, resetHeadingIds } from "@/lib/editor/extensions";

const lowlight = createLowlight(common);

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  useEffect(() => {
    resetHeadingIds();
  }, [content]);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const editor = useEditor({
    extensions: getReaderExtensions({ lowlight }),
    content: mounted ? JSON.parse(content) : undefined,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  if (!mounted || !editor) {
    return <div className="h-48 animate-shimmer rounded-lg" />;
  }

  return <EditorContent editor={editor} />;
}

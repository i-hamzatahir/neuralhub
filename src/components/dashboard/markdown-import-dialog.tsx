"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { markdownToTipTap } from "@/lib/editor/markdown-to-tiptap";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

interface MarkdownImportDialogProps {
  hasExistingContent: boolean;
  onImport: (content: string) => void;
}

export function MarkdownImportDialog({
  hasExistingContent,
  onImport,
}: MarkdownImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleImport(markdown: string) {
    const trimmed = markdown.trim();
    if (!trimmed) {
      setError("Paste markdown content from ChatGPT first.");
      return;
    }

    try {
      const content = markdownToTipTap(trimmed);
      onImport(content);
      setMarkdown("");
      setError(null);
      setOpen(false);
    } catch {
      setError("Could not parse markdown. Check formatting and try again.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Import Markdown
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>Import from ChatGPT</ModalTitle>
            <ModalDescription>
              Paste markdown from ChatGPT or any writing tool. Headings, lists,
              links, bold, italic, and code blocks are converted automatically.
            </ModalDescription>
          </ModalHeader>

          <Textarea
            value={markdown}
            onChange={(e) => {
              setMarkdown(e.target.value);
              setError(null);
            }}
            placeholder={"## Your article title\n\nPaste your ChatGPT output here…\n\n- Bullet points work\n- **Bold** and *italic* too\n\n```js\nconst hello = 'world';\n```"}
            rows={14}
            className="font-mono text-sm"
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {hasExistingContent && (
            <p className="text-xs text-muted-foreground">
              Importing will replace the current editor content.
            </p>
          )}

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => handleImport(markdown)}>
              Import into editor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { suggestInternalLinksAction, type InternalLinkSuggestion } from "@/lib/actions/internal-links";
import { Button } from "@/components/ui/button";

interface InternalLinkSuggestionsProps {
  articleId?: string;
  title: string;
  tags: string;
  content: string;
}

export function InternalLinkSuggestions({
  articleId,
  title,
  tags,
  content,
}: InternalLinkSuggestionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([]);

  useEffect(() => {
    if (!title.trim() && !tags.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await suggestInternalLinksAction({
          articleId,
          title,
          tags,
          content,
        });
        if (result.success) {
          setSuggestions(result.suggestions ?? []);
          setError(null);
        } else {
          setError(result.error ?? "Could not load suggestions");
        }
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [articleId, title, tags, content]);

  const hasQuery = Boolean(title.trim() || tags.trim());
  const visibleSuggestions = hasQuery ? suggestions : [];

  async function copyMarkdown(id: string, markdown: string) {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Clipboard unavailable");
    }
  }

  if (!title.trim() && !tags.trim()) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Internal link ideas</h3>
          <p className="text-xs text-muted-foreground">
            Link to related posts on your blog for better SEO.
          </p>
        </div>
      </div>

      {pending && (
        <p className="mt-3 text-xs text-muted-foreground">Finding related articles…</p>
      )}

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}

      {!pending && visibleSuggestions.length === 0 && !error && hasQuery && (
        <p className="mt-3 text-xs text-muted-foreground">
          No suggestions yet — publish more articles to build internal links.
        </p>
      )}

      {visibleSuggestions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {visibleSuggestions.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border bg-muted/20 px-3 py-2"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.reason}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-8 px-2"
                onClick={() => copyMarkdown(item.id, item.markdown)}
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Copy link markdown
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

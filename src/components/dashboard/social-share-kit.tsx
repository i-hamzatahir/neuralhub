"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { buildSocialShareKit } from "@/lib/social/share-kit";
import { Button } from "@/components/ui/button";

interface SocialShareKitProps {
  title: string;
  excerpt: string;
  slug: string;
  appUrl: string;
}

type ShareField = "twitter" | "linkedin" | "newsletter";

const labels: Record<ShareField, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  newsletter: "Newsletter blurb",
};

export function SocialShareKitPanel({
  title,
  excerpt,
  slug,
  appUrl,
}: SocialShareKitProps) {
  const [copiedField, setCopiedField] = useState<ShareField | null>(null);

  const kit = useMemo(
    () => buildSocialShareKit({ title, excerpt, slug, appUrl }),
    [title, excerpt, slug, appUrl],
  );

  if (!title.trim()) return null;

  async function copyField(field: ShareField, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Social share kit</h3>
          <p className="text-xs text-muted-foreground">
            Copy ready-made posts when you publish.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {(Object.keys(labels) as ShareField[]).map((field) => (
          <div key={field} className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {labels[field]}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => copyField(field, kit[field])}
              >
                {copiedField === field ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{kit[field]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

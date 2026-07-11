"use client";

import { useActionState } from "react";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input, InputGroup } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface NewsletterSubscribeFormProps {
  source: "footer" | "newsletter-page";
  compact?: boolean;
  className?: string;
}

export function NewsletterSubscribeForm({
  source,
  compact = false,
  className,
}: NewsletterSubscribeFormProps) {
  const [state, formAction, pending] = useActionState(subscribeNewsletterAction, {
    success: false,
  });

  if (state.success && state.message) {
    return (
      <p
        className={cn(
          "text-sm text-success",
          compact ? "max-w-sm" : "",
          className,
        )}
      >
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className={cn(
        compact ? "flex w-full max-w-sm gap-2" : "space-y-4",
        className,
      )}
    >
      <input type="hidden" name="source" value={source} />

      {state.error && (
        <div
          className={cn(
            "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
            compact && "w-full",
          )}
        >
          {state.error}
        </div>
      )}

      {!compact && (
        <InputGroup label="Name (optional)" htmlFor={`name-${source}`}>
          <Input
            id={`name-${source}`}
            name="name"
            placeholder="Your name"
            autoComplete="name"
          />
        </InputGroup>
      )}

      {compact ? (
        <>
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            aria-label="Email address"
            className="flex-1"
            required
          />
          <Button type="submit" loading={pending}>
            Subscribe
          </Button>
        </>
      ) : (
        <>
          <InputGroup label="Email" htmlFor={`email-${source}`}>
            <Input
              id={`email-${source}`}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </InputGroup>
          <Button type="submit" size="lg" loading={pending}>
            Subscribe
          </Button>
        </>
      )}
    </form>
  );
}

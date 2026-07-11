"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ArticleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-display text-2xl font-semibold">
        Could not load article
      </h1>
      <p className="mt-3 text-muted-foreground">
        Something went wrong while loading this page. Please try again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/articles">Browse articles</Link>
        </Button>
      </div>
    </div>
  );
}

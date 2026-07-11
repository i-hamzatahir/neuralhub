import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface StaticPageProps {
  title: string;
  description?: string;
  path: string;
  children: React.ReactNode;
}

export function StaticPage({ title, description, path, children }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>
      <header className="mb-10">
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && (
          <p className="text-body mt-3 text-lg text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="prose prose-zinc dark:prose-invert max-w-none">{children}</div>
      <meta itemProp="url" content={path} />
    </div>
  );
}

export function buildStaticPageMetadata(
  title: string,
  description: string,
  path: string,
) {
  return buildPageMetadata({ title, description, path });
}

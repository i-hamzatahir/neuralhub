import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface ComingSoonPageProps {
  title: string;
  description: string;
  path: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function ComingSoonPage({
  title,
  description,
  path,
  ctaHref = "/articles",
  ctaLabel = "Browse articles",
}: ComingSoonPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-label mb-4">Coming soon</p>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="text-body mt-4 text-lg text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
      <meta itemProp="url" content={path} />
    </div>
  );
}

export function buildComingSoonMetadata(
  title: string,
  description: string,
  path: string,
) {
  return buildPageMetadata({ title, description, path });
}

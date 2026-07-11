import Link from "next/link";
import { Rss } from "lucide-react";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { NewsletterSubscribeForm } from "@/components/newsletter/newsletter-subscribe-form";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "Newsletter",
  `Subscribe to ${siteConfig.name} for curated AI, data science, and technology articles.`,
  "/newsletter",
);

interface PageProps {
  searchParams: Promise<{ unsubscribed?: string }>;
}

export default async function NewsletterPage({ searchParams }: PageProps) {
  const { unsubscribed } = await searchParams;

  return (
    <StaticPage
      title="Newsletter"
      description="Curated articles on AI, data science, and technology — delivered to your inbox."
      path="/newsletter"
    >
      {unsubscribed === "1" && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          You have been unsubscribed. Sorry to see you go.
        </div>
      )}

      <p>
        Join thousands of readers staying ahead in AI and tech. We send
        thoughtfully curated articles — no spam, unsubscribe anytime.
      </p>

      <div className="rounded-xl border border-border bg-card p-6">
        <NewsletterSubscribeForm source="newsletter-page" />
      </div>

      <p className="text-sm text-muted-foreground">
        Prefer RSS?{" "}
        <Link
          href="/feed.xml"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <Rss className="h-4 w-4" />
          Subscribe via RSS
        </Link>
      </p>
    </StaticPage>
  );
}

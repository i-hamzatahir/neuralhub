import Link from "next/link";
import { confirmNewsletterSubscription } from "@/lib/services/newsletter/newsletter.service";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { Button } from "@/components/ui/button";

export const metadata = buildStaticPageMetadata(
  "Confirm subscription",
  "Confirm your NeuralHub newsletter subscription.",
  "/newsletter/confirm",
);

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <StaticPage
        title="Invalid link"
        description="This confirmation link is missing a token."
        path="/newsletter/confirm"
      >
        <p>The confirmation link appears to be incomplete.</p>
        <Button asChild>
          <Link href="/newsletter">Back to newsletter</Link>
        </Button>
      </StaticPage>
    );
  }

  const result = await confirmNewsletterSubscription(token);

  if (!result.success) {
    return (
      <StaticPage
        title="Confirmation failed"
        description="We couldn't confirm your subscription."
        path="/newsletter/confirm"
      >
        <p>{result.error}</p>
        <Button asChild>
          <Link href="/newsletter">Try subscribing again</Link>
        </Button>
      </StaticPage>
    );
  }

  return (
    <StaticPage
      title="You're subscribed!"
      description="Your newsletter subscription is confirmed."
      path="/newsletter/confirm"
    >
      <p>
        Thanks for confirming. You&apos;ll receive curated articles from
        NeuralHub in your inbox.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/articles">Browse articles</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </StaticPage>
  );
}

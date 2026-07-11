import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = buildStaticPageMetadata(
  "Contact",
  `Get in touch with the ${siteConfig.name} team.`,
  "/contact",
);

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      description="We'd love to hear from you."
      path="/contact"
    >
      <p>
        For general inquiries, partnerships, or support, reach out through the
        channels below.
      </p>
      <h2>Email</h2>
      <p>
        <a href="mailto:hello@neuralhub.dev">hello@neuralhub.dev</a>
      </p>
      <h2>Authors</h2>
      <p>
        Ready to publish?{" "}
        <Link href="/write" className="text-primary hover:underline">
          Become an author
        </Link>{" "}
        and start writing from your dashboard.
      </p>
      <h2>Report an issue</h2>
      <p>
        Found a bug or security concern? Include steps to reproduce and your
        browser details when contacting us.
      </p>
      <div className="not-prose mt-8 flex gap-3">
        <Button asChild>
          <a href="mailto:hello@neuralhub.dev">Send email</a>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/about">About us</Link>
        </Button>
      </div>
    </StaticPage>
  );
}

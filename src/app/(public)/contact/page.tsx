import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { isPersonalSite } from "@/config/site-mode";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export const metadata = buildStaticPageMetadata(
  "Contact",
  `Contact ${siteConfig.name} for questions, feedback, corrections, and business inquiries.`,
  "/contact",
);

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      description="We read every message and aim to respond within a few business days."
      path="/contact"
    >
      <p>
        Whether you have a question about an article, spotted an error, want to
        collaborate, or have a business inquiry, we&apos;d like to hear from you.
      </p>

      <h2>General inquiries</h2>
      <p>
        Email:{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </p>

      <h2>What to include</h2>
      <ul>
        <li>
          <strong>Article corrections:</strong> the article URL, what needs
          updating, and your source if applicable
        </li>
        <li>
          <strong>Technical issues:</strong> steps to reproduce, browser/device,
          and screenshots if helpful
        </li>
        <li>
          <strong>Privacy requests:</strong> specify the data subject request
          (access, deletion, unsubscribe)
        </li>
        <li>
          <strong>Business inquiries:</strong> sponsorship, partnerships, or
          speaking opportunities with relevant context
        </li>
      </ul>

      {!isPersonalSite && (
        <>
          <h2>Writing for {siteConfig.name}</h2>
          <p>
            Interested in contributing? Review our{" "}
            <Link href="/editorial">editorial standards</Link> and visit the{" "}
            <Link href="/write">write page</Link> to get started.
          </p>
        </>
      )}

      {isPersonalSite && (
        <>
          <h2>Guest posts and promotions</h2>
          <p>
            {siteConfig.name} is currently operated as a personal publication.
            We are not accepting guest posts, paid placements, or unsolicited
            promotional content at this time.
          </p>
        </>
      )}

      <h2>Related pages</h2>
      <ul>
        <li>
          <Link href="/about">About {siteConfig.name}</Link>
        </li>
        <li>
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/editorial">Editorial Standards</Link>
        </li>
      </ul>

      <div className="not-prose mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <a href={`mailto:${siteConfig.contactEmail}`}>Send email</a>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/about">About us</Link>
        </Button>
      </div>
    </StaticPage>
  );
}

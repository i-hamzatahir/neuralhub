import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Accessibility",
  `Accessibility commitment and support options for ${siteConfig.name}.`,
  "/accessibility",
);

export default function AccessibilityPage() {
  return (
    <StaticPage
      title="Accessibility Statement"
      description={legalIntro()}
      path="/accessibility"
    >
      <p>
        {siteConfig.name} is committed to making our content accessible to as
        many readers as possible, including people who use assistive
        technologies.
      </p>

      <h2>Our commitment</h2>
      <p>
        We aim to follow widely recognized accessibility practices, including
        principles aligned with the Web Content Accessibility Guidelines (WCAG)
        2.1 Level AA where reasonably possible.
      </p>

      <h2>Measures we take</h2>
      <ul>
        <li>Semantic HTML structure for headings, landmarks, and navigation</li>
        <li>Keyboard-accessible navigation and interactive controls</li>
        <li>Readable typography, contrast-aware color tokens, and responsive layout</li>
        <li>Alternative text for meaningful images where applicable</li>
        <li>Descriptive link text and page titles for screen readers</li>
        <li>Reduced-motion support through user system preferences</li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        Some older articles, embedded third-party media, or dynamically loaded
        components may not yet meet every accessibility requirement. We
        continue to improve the site over time.
      </p>

      <h2>Third-party content</h2>
      <p>
        External embeds, advertising units, or linked tools may be controlled by
        third parties with their own accessibility policies.
      </p>

      <h2>Feedback and assistance</h2>
      <p>
        If you encounter a barrier while using {siteConfig.name}, please contact
        us at{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>{" "}
        with:
      </p>
      <ul>
        <li>The page URL</li>
        <li>A description of the issue</li>
        <li>Your browser and assistive technology, if relevant</li>
      </ul>
      <p>We will do our best to respond and address the problem.</p>

      <h2>Related policies</h2>
      <ul>
        <li>
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </StaticPage>
  );
}

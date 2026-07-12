import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Disclaimer",
  `Important disclaimers for readers of ${siteConfig.name}.`,
  "/disclaimer",
);

export default function DisclaimerPage() {
  return (
    <StaticPage
      title="Disclaimer"
      description={legalIntro()}
      path="/disclaimer"
    >
      <p>
        The information on {siteConfig.name} is provided for general educational
        and informational purposes. Please read this disclaimer carefully before
        relying on any content published on the site.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Content on this blog does not constitute legal, financial, medical, or
        other professional advice. Always consult qualified professionals for
        decisions that affect your business, health, compliance, or finances.
      </p>

      <h2>Technology changes quickly</h2>
      <p>
        Software libraries, APIs, pricing, and best practices evolve rapidly.
        Articles reflect the author&apos;s understanding at the time of
        publication. Features, limits, and recommendations may change after an
        article is published.
      </p>

      <h2>Accuracy and completeness</h2>
      <p>
        We aim for accuracy, but we do not guarantee that every article is
        complete, current, or free from errors. If you find a mistake, please{" "}
        <Link href="/contact">contact us</Link> so we can review and correct it.
      </p>

      <h2>Third-party products and links</h2>
      <p>
        Mentions of tools, frameworks, cloud services, or external websites are
        for informational purposes. {siteConfig.name} is not responsible for
        third-party products, policies, outages, or security practices unless
        explicitly stated otherwise.
      </p>

      <h2>Affiliate links and advertising</h2>
      <p>
        Some articles or pages may include affiliate links or display
        advertisements. We label sponsored or affiliate relationships where
        applicable. Your use of third-party offers is at your own discretion.
      </p>

      <h2>No warranties</h2>
      <p>
        The site and its content are provided &quot;as is&quot; without warranties
        of any kind, express or implied, including fitness for a particular
        purpose or non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        {siteConfig.name} and its operators will not be liable for any loss or
        damage arising from your use of the site or reliance on published
        content, to the fullest extent permitted by law.
      </p>

      <h2>Related policies</h2>
      <ul>
        <li>
          <Link href="/terms">Terms of Service</Link>
        </li>
        <li>
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/editorial">Editorial Standards</Link>
        </li>
      </ul>
    </StaticPage>
  );
}

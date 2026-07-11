import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "Terms of Service",
  `Terms governing use of the ${siteConfig.name} platform.`,
  "/terms",
);

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      description={`Last updated: ${new Date().getFullYear()}`}
      path="/terms"
    >
      <p>
        By accessing {siteConfig.name}, you agree to these terms. If you do not
        agree, please do not use the platform.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for maintaining the security of your account and for
        all activity under it. You must provide accurate registration
        information and keep your credentials confidential.
      </p>
      <h2>Content</h2>
      <p>
        Authors retain ownership of content they publish. By publishing, you
        grant {siteConfig.name} a license to display, distribute, and promote
        your content on the platform and through feeds such as RSS.
      </p>
      <p>
        You agree not to publish unlawful, infringing, harassing, or misleading
        content. We may remove content or suspend accounts that violate these
        terms.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attempt to breach platform security</li>
        <li>Do not scrape or abuse APIs beyond normal use</li>
        <li>Do not spam, impersonate others, or manipulate engagement</li>
      </ul>
      <h2>Disclaimer</h2>
      <p>
        Content on {siteConfig.name} represents the views of individual authors,
        not {siteConfig.name}. The platform is provided &quot;as is&quot; without
        warranties of any kind.
      </p>
      <h2>Contact</h2>
      <p>
        For questions about these terms, visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}

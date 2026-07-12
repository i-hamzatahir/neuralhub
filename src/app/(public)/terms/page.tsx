import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { isPersonalSite } from "@/config/site-mode";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Terms of Service",
  `Terms and conditions for using ${siteConfig.name}.`,
  "/terms",
);

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      description={legalIntro()}
      path="/terms"
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of {siteConfig.name} at {siteConfig.url}. By using the site, you agree
        to these Terms.
      </p>

      <h2>Using the website</h2>
      <p>
        You may browse and read published content for personal, non-commercial
        use unless otherwise stated. You agree not to misuse the site, interfere
        with its operation, or attempt unauthorized access to systems or data.
      </p>

      <h2>Accounts</h2>
      <p>
        {isPersonalSite
          ? "Public registration may be disabled. Authorized administrator accounts are for site management only. Account holders are responsible for safeguarding credentials and activity under their account."
          : "If you create an account, you are responsible for safeguarding your credentials and for all activity under your account. You must provide accurate registration information."}
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        Articles, branding, design, and original materials on {siteConfig.name}{" "}
        are protected by applicable copyright and intellectual property laws
        unless otherwise noted.
      </p>
      <ul>
        <li>
          You may quote brief excerpts with clear attribution and a link to the
          original article
        </li>
        <li>
          You may not republish full articles, scrape content at scale, or
          misrepresent authorship
        </li>
        <li>
          Third-party trademarks, logos, and tools mentioned belong to their
          respective owners
        </li>
      </ul>

      {!isPersonalSite && (
        <>
          <h2>User-generated content</h2>
          <p>
            Authors retain ownership of content they publish. By publishing,
            you grant {siteConfig.name} a non-exclusive license to display,
            distribute, and promote your content on the site and through feeds
            such as RSS.
          </p>
        </>
      )}

      <h2>Prohibited conduct</h2>
      <ul>
        <li>Attempting to breach site security or access restricted areas</li>
        <li>Automated scraping beyond normal reader use</li>
        <li>Spam, harassment, impersonation, or misleading submissions</li>
        <li>Uploading malware or unlawful material</li>
        <li>Violating applicable laws or third-party rights</li>
      </ul>

      <h2>Newsletter and communications</h2>
      <p>
        If you subscribe to our newsletter, you consent to receive emails from
        us. You can unsubscribe at any time using the link in each message or
        our <Link href="/newsletter/unsubscribe">unsubscribe page</Link>.
      </p>

      <h2>Third-party links and services</h2>
      <p>
        The site may link to external websites, tools, or services. We are not
        responsible for third-party content, policies, or practices. Use them at
        your own discretion.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The site and its content are provided on an &quot;as is&quot; and &quot;as
        available&quot; basis without warranties of any kind. See our{" "}
        <Link href="/disclaimer">Disclaimer</Link> for more information.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {siteConfig.name} will not be
        liable for indirect, incidental, special, consequential, or punitive
        damages arising from your use of the site.
      </p>

      <h2>Changes and termination</h2>
      <p>
        We may modify these Terms or discontinue parts of the service at any
        time. Continued use after changes means you accept the revised Terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of {siteConfig.legal.jurisdiction},
        without regard to conflict-of-law principles.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>{" "}
        or through our <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}

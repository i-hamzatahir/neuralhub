import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Cookie Policy",
  `How ${siteConfig.name} uses cookies and similar technologies.`,
  "/cookies",
);

export default function CookiesPage() {
  return (
    <StaticPage
      title="Cookie Policy"
      description={legalIntro()}
      path="/cookies"
    >
      <p>
        This Cookie Policy explains how {siteConfig.name} uses cookies and
        similar technologies when you visit {siteConfig.url}. It should be read
        alongside our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your browser. They
        help websites remember preferences, keep you signed in, and understand
        how the site is used.
      </p>

      <h2>How we use cookies</h2>
      <h3>Essential cookies</h3>
      <p>
        Required for core functionality such as administrator authentication,
        session security, and CSRF protection. These cannot be disabled if you
        need to use account features.
      </p>

      <h3>Preference cookies</h3>
      <p>
        Remember choices such as theme settings or whether you have responded to
        our cookie notice.
      </p>

      <h3>Analytics cookies (optional)</h3>
      <p>
        With your consent, we may use analytics services such as Google Analytics
        or Microsoft Clarity to understand aggregate traffic and improve content.
        These tools may set their own cookies.
      </p>

      <h3>Advertising cookies (optional)</h3>
      <p>
        If advertising is enabled, partners such as Google AdSense may use
        cookies to deliver and measure ads. You can manage personalization in
        your browser or Google ad settings.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Use our cookie banner to accept or decline optional analytics</li>
        <li>Adjust browser settings to block or delete cookies</li>
        <li>Use private browsing modes that limit persistent storage</li>
        <li>Opt out of Google Analytics via Google&apos;s browser add-on</li>
      </ul>

      <h2>Other tracking technologies</h2>
      <p>
        We may use local storage, server logs, and similar technologies for
        security, performance, and basic audience measurement. These are
        governed by the same principles described here and in our privacy policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies? Email{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        .
      </p>
    </StaticPage>
  );
}

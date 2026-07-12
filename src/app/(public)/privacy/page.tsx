import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { isPersonalSite } from "@/config/site-mode";
import { siteConfig } from "@/config/site";
import { legalIntro } from "@/config/static-pages";

export const metadata = buildStaticPageMetadata(
  "Privacy Policy",
  `How ${siteConfig.name} collects, uses, stores, and protects your personal information.`,
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description={legalIntro()}
      path="/privacy"
    >
      <p>
        {siteConfig.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
        operates {siteConfig.url}. This Privacy Policy explains what
        information we collect, how we use it, and the choices you have when
        using our website.
      </p>

      <h2>Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, username, and
          password (stored as a secure hash)
        </li>
        <li>
          <strong>Newsletter sign-ups:</strong> email address and subscription
          preferences
        </li>
        <li>
          <strong>Communications:</strong> messages you send through our
          contact channels
        </li>
        {!isPersonalSite && (
          <li>
            <strong>User content:</strong> articles, comments, bookmarks, and
            media you upload when those features are enabled
          </li>
        )}
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>Pages visited, referring URLs, and general usage patterns</li>
        <li>Device type, browser, operating system, and language settings</li>
        <li>IP address and approximate location derived from network data</li>
        <li>Reading activity such as article views and time on page</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Operate, secure, and improve the website</li>
        <li>Authenticate administrators and authorized users</li>
        <li>Send transactional emails such as verification or password reset</li>
        <li>Deliver newsletters you have opted into</li>
        <li>Measure audience interest and improve content quality</li>
        <li>Detect abuse, spam, and security incidents</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Legal bases for processing</h2>
      <p>
        Where applicable, we process personal data on the basis of consent
        (newsletter subscriptions, optional analytics), contract (providing
        services you request), legitimate interests (site security, audience
        measurement, and improvement), and legal obligation.
      </p>

      <h2>Cookies and similar technologies</h2>
      <p>
        We use essential cookies for authentication, session management, and
        security. With your consent, we may also use analytics cookies to
        understand how readers use the site. See our{" "}
        <Link href="/cookies">Cookie Policy</Link> for details and choices.
      </p>

      <h2>Analytics and advertising</h2>
      <p>
        When enabled, we may use privacy-oriented analytics tools such as Google
        Analytics and Microsoft Clarity to understand aggregate traffic patterns.
        If advertising is enabled, third-party partners such as Google AdSense
        may use cookies to serve and measure ads. You can manage ad
        personalization through your browser settings and Google&apos;s ad
        settings.
      </p>

      <h2>How we share information</h2>
      <p>We do not sell your personal information. We may share limited data with:</p>
      <ul>
        <li>
          <strong>Infrastructure providers</strong> that host the site, database,
          email, and media storage
        </li>
        <li>
          <strong>Analytics and advertising partners</strong> when those
          services are active
        </li>
        <li>
          <strong>Authorities</strong> when required by law or to protect rights
          and safety
        </li>
      </ul>

      <h2>Data retention</h2>
      <p>
        We retain account and newsletter data while your relationship with us is
        active or as needed to provide services. Analytics and security logs are
        kept for a limited period. You may request deletion of your account or
        newsletter subscription by contacting us.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct,
        delete, restrict, or object to certain processing of your personal data,
        and to withdraw consent where processing is consent-based. To exercise
        these rights, contact us at{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        .
      </p>

      <h2>International visitors</h2>
      <p>
        {siteConfig.name} is accessible worldwide. If you access the site from
        outside {siteConfig.legal.jurisdiction}, your information may be
        processed in countries where our service providers operate.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        This site is intended for a general audience and is not directed at
        children under 13. We do not knowingly collect personal information from
        children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected on this page with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or requests can be sent to{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>{" "}
        or through our <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}

import Link from "next/link";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { siteConfig } from "@/config/site";

export const metadata = buildStaticPageMetadata(
  "Privacy Policy",
  `How ${siteConfig.name} collects, uses, and protects your data.`,
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description={`Last updated: ${new Date().getFullYear()}`}
      path="/privacy"
    >
      <p>
        This policy describes how {siteConfig.name} (&quot;we&quot;, &quot;us&quot;)
        handles personal information when you use our website and services.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Account information: name, email, username, and profile details</li>
        <li>Content you publish: articles, comments, and media uploads</li>
        <li>Usage data: page views, reading activity, and referral sources</li>
        <li>Technical data: IP address, browser type, and device information</li>
      </ul>
      <h2>How we use information</h2>
      <ul>
        <li>Provide and improve the platform</li>
        <li>Authenticate users and secure accounts</li>
        <li>Send transactional emails (verification, password reset)</li>
        <li>Analyze aggregate usage via analytics tools</li>
      </ul>
      <h2>Cookies and analytics</h2>
      <p>
        We use essential cookies for authentication and optional analytics
        (Google Analytics) when configured. You can control browser cookies
        through your device settings.
      </p>
      <h2>Advertising</h2>
      <p>
        When enabled, we may display third-party advertisements through Google
        AdSense. Ad partners may use cookies to serve personalized ads. You can
        manage ad personalization in your Google Ads Settings or browser
        privacy controls.
      </p>
      <h2>Data retention</h2>
      <p>
        We retain account and content data while your account is active. You may
        request account deletion by contacting us.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy? Visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}

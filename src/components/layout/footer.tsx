import Link from "next/link";
import { Brain, ExternalLink } from "lucide-react";
import { brand, footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { NewsletterSubscribeForm } from "@/components/newsletter/newsletter-subscribe-form";
import { AdSlot } from "@/components/ads/ad-slot";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { title: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-label mb-4">{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="footer" className="py-4" />

        {/* Newsletter band */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border py-12 sm:flex-row sm:items-center">
          <div className="max-w-md">
            <h2 className="text-display text-xl font-semibold">
              Stay ahead of the curve
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get the latest in AI, data science, and technology delivered to
              your inbox. Free, no spam.
            </p>
          </div>
          <NewsletterSubscribeForm source="footer" compact />
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          <FooterColumn title="Platform" links={footerNav.platform} />
          <FooterColumn title="Topics" links={footerNav.topics} />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Legal" links={footerNav.legal} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm text-muted-foreground">
              © {year} {brand.name}. {brand.tagline}.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.links.twitter}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href={siteConfig.links.github}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

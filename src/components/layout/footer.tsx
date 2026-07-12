import Link from "next/link";
import { ExternalLink, Rss } from "lucide-react";
import { brand, footerNav, topicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { NewsletterSubscribeForm } from "@/components/newsletter/newsletter-subscribe-form";
import { AdSlot } from "@/components/ads/ad-slot";
import { isPersonalSite } from "@/config/site-mode";
import { BrandLogo } from "@/components/layout/brand-logo";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { title: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="blog-container">
        <AdSlot slot="footer" className="py-4" />

        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <BrandLogo className="mb-4" />
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <Link
                href="/feed.xml"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary"
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                GitHub
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Newsletter</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Weekly articles on AI, data science, and engineering.
            </p>
            <div className="mt-4">
              <NewsletterSubscribeForm source="footer" compact />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-border py-10 sm:grid-cols-4">
          <FooterColumn title="Browse" links={footerNav.platform} />
          <FooterColumn
            title="Categories"
            links={topicNav.map((item) => ({
              title: item.title,
              href: item.href,
            }))}
          />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Legal" links={footerNav.legal} />
        </div>

        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <p>© {year} {brand.name}. {brand.tagline}.</p>
          {isPersonalSite && (
            <Link href="/login" className="mt-2 inline-block hover:text-primary sm:mt-0">
              Admin login
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

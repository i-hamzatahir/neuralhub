import Link from "next/link";
import { BookOpen, Mail, Search, TrendingUp } from "lucide-react";
import { CompactArticleRow } from "@/components/articles/compact-article-row";
import { NewsletterSubscribeForm } from "@/components/newsletter/newsletter-subscribe-form";
import { isPersonalSite } from "@/config/site-mode";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

interface HomeSidebarProps {
  popularArticles: ArticleWithRelations[];
}

const quickLinks = [
  { href: "/start-here", label: "Start here", icon: BookOpen },
  { href: "/search", label: "Search articles", icon: Search },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
] as const;

export function HomeSidebar({ popularArticles }: HomeSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Sidebar">
      {popularArticles.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-tight">Most read</h2>
          </div>
          <div>
            {popularArticles.slice(0, 5).map((article, index) => (
              <CompactArticleRow
                key={article.id}
                article={article}
                rank={index + 1}
              />
            ))}
          </div>
          <Link
            href="/articles"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            View all articles
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-bold tracking-tight">Quick links</h2>
        <ul className="mt-3 space-y-1">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary/80" />
                {label}
              </Link>
            </li>
          ))}
          {!isPersonalSite && (
            <li>
              <Link
                href="/about"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-primary/80" />
                About NeuralHub
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/[0.06] to-card p-5">
        <h2 className="text-sm font-bold tracking-tight">
          {isPersonalSite ? "Get new posts" : "Newsletter"}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {isPersonalSite
            ? "New articles on AI, data science, and software engineering."
            : "Weekly tutorials and research summaries in your inbox."}
        </p>
        <div className="mt-4">
          <NewsletterSubscribeForm source="footer" compact />
        </div>
      </div>
    </aside>
  );
}

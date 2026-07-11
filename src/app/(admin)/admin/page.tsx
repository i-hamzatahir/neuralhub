import Link from "next/link";
import { getPlatformStats } from "@/lib/services/admin/admin.service";
import { getNewsletterStats } from "@/lib/services/newsletter/newsletter.service";
import { runScheduledPublishAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [stats, newsletter] = await Promise.all([
    getPlatformStats(),
    getNewsletterStats(),
  ]);

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl font-semibold">Admin overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform statistics and editorial tools
          </p>
        </div>
        <form action={runScheduledPublishAction}>
          <Button type="submit" variant="outline" size="sm">
            Run scheduled publish
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats.totalUsers, href: "/admin/users" },
          { label: "Articles", value: stats.totalArticles, href: "/admin/articles" },
          { label: "Published", value: stats.publishedArticles, href: "/admin/articles" },
          {
            label: "Review queue",
            value: stats.reviewQueue,
            href: "/admin/articles?status=REVIEW",
            highlight: stats.reviewQueue > 0,
          },
          { label: "Comments", value: stats.totalComments, href: "/admin/comments" },
          {
            label: "Newsletter",
            value: newsletter.active,
            href: "/admin/newsletter",
          },
          { label: "Total views", value: stats.totalViews.toLocaleString() },
          { label: "Scheduled", value: stats.scheduledCount },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border border-border bg-card p-5 ${
              item.highlight ? "border-warning/50 bg-warning/5" : ""
            }`}
          >
            <p className="text-label">{item.label}</p>
            <p className="text-display mt-2 text-2xl font-semibold">{item.value}</p>
            {item.href && (
              <Link
                href={item.href}
                className="mt-2 inline-block text-xs text-primary hover:underline"
              >
                Manage →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/auth/policies";
import { getPlatformAnalytics } from "@/lib/services/admin/admin.service";

export const metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user)) {
    redirect("/admin?error=unauthorized");
  }

  const analytics = await getPlatformAnalytics();

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Platform analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events and traffic referrers across the platform
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total events", value: analytics.totalEvents },
          { label: "Article views", value: analytics.totalArticleViews },
          { label: "Events (7d)", value: analytics.eventsLast7Days },
          { label: "Views (7d)", value: analytics.viewsLast7Days },
          { label: "Events (30d)", value: analytics.eventsLast30Days },
          { label: "Views (30d)", value: analytics.viewsLast30Days },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-label">{item.label}</p>
            <p className="text-display mt-2 text-2xl font-semibold">
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-semibold">Events by type</h2>
          {analytics.eventCounts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No analytics events recorded yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium">Event</th>
                    <th className="px-4 py-3 text-right font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.eventCounts.map((row) => (
                    <tr
                      key={row.event}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{row.event}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold">Top referrers</h2>
          {analytics.referrers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No article view referrers recorded yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium">Referrer</th>
                    <th className="px-4 py-3 text-right font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.referrers.map((row) => (
                    <tr
                      key={row.referrer}
                      className="border-b border-border last:border-0"
                    >
                      <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
                        {row.referrer}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

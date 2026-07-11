import {
  getNewsletterStats,
  listNewsletterSubscribers,
} from "@/lib/services/newsletter/newsletter.service";
import { AdminNewsletterTable } from "@/components/admin/admin-newsletter-table";

export const metadata = { title: "Admin — Newsletter" };

export default async function AdminNewsletterPage() {
  const [stats, { subscribers }] = await Promise.all([
    getNewsletterStats(),
    listNewsletterSubscribers({ limit: 100 }),
  ]);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscriber management and growth metrics
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total signups", value: stats.total },
          { label: "Verified", value: stats.verified },
          { label: "Active", value: stats.active },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-label">{item.label}</p>
            <p className="text-display mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <AdminNewsletterTable subscribers={subscribers} />
    </div>
  );
}

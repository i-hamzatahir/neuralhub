import Link from "next/link";
import { listAuthorCalendarArticles } from "@/lib/services/articles/article.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ContentCalendar } from "@/components/dashboard/content-calendar";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Content calendar" };

export default async function DashboardCalendarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const articles = await listAuthorCalendarArticles(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl font-semibold">Content calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan and track scheduled, published, and draft articles.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">New article</Link>
        </Button>
      </div>
      <div className="mt-6">
        <ContentCalendar articles={articles} />
      </div>
    </div>
  );
}

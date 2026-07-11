import { getArticleAnalytics } from "@/lib/services/articles/article.service";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, MessageSquare, Heart, Bookmark, Users } from "lucide-react";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { topArticles, viewsLast7Days, uniqueReaders, referrers } =
    await getArticleAnalytics(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-display text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-muted-foreground">Article performance overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Views (last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{viewsLast7Days}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique readers (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2 text-3xl font-semibold">
              <Users className="h-6 w-6 text-muted-foreground" />
              {uniqueReaders}
            </p>
          </CardContent>
        </Card>
      </div>

      {referrers.length > 0 && (
        <>
          <h2 className="text-display mt-8 text-lg font-semibold">
            Top referrers (30 days)
          </h2>
          <div className="mt-4 space-y-2">
            {referrers.map((ref) => (
              <div
                key={ref.referrer}
                className="flex justify-between rounded-lg border border-border px-4 py-2 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {ref.referrer}
                </span>
                <span className="font-medium">{ref.count}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-display mt-8 text-lg font-semibold">Top articles</h2>
      <div className="mt-4 space-y-3">
        {topArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        ) : (
          topArticles.map((article) => (
            <Card key={article.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {article.status.toLowerCase()}
                  </p>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {article._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {article._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" />
                    {article._count.bookmarks}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

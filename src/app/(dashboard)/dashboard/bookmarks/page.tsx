import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUserBookmarks } from "@/lib/services/engagement/engagement.service";
import { ArticleCard } from "@/components/articles/article-card";
import type { ArticleWithRelations } from "@/lib/services/articles/article.service";

export const metadata = {
  title: "Bookmarks",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BookmarksPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/bookmarks");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { articles, total, pages } = await listUserBookmarks(
    session.user.id,
    page,
  );

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} saved article{total !== 1 ? "s" : ""}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
          No bookmarks yet. Save articles while reading to find them here.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article as ArticleWithRelations}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/bookmarks?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

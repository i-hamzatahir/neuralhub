import Link from "next/link";
import { listAuthorArticles } from "@/lib/services/articles/article.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ArticleTable } from "@/components/dashboard/article-table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Articles" };

export default async function DashboardArticlesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const articles = await listAuthorArticles(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl font-semibold">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">New article</Link>
        </Button>
      </div>
      <div className="mt-6">
        <ArticleTable articles={articles} />
      </div>
    </div>
  );
}

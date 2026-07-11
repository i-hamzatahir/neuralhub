import { listAdminArticles } from "@/lib/services/admin/admin.service";
import { AdminArticleTable } from "@/components/admin/admin-article-table";
import type { ArticleStatus } from "@/generated/prisma/client";

export const metadata = { title: "Admin — Articles" };

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status: statusParam, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const status = statusParam as ArticleStatus | undefined;

  const { articles, total } = await listAdminArticles({
    status: status && ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].includes(status)
      ? status
      : undefined,
    page,
  });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">
          {status === "REVIEW" ? "Review queue" : "Articles"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} article{total !== 1 ? "s" : ""}
          {status === "REVIEW" && " awaiting editorial review"}
        </p>
      </header>
      <AdminArticleTable articles={articles} />
    </div>
  );
}

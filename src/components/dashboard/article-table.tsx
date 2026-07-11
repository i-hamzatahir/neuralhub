"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { deleteArticleAction, updateStatusAction } from "@/lib/actions/articles";
import { Button } from "@/components/ui/button";
import type { ArticleStatus } from "@/generated/prisma/client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  viewCount: number;
  updatedAt: Date;
  category: { name: string };
}

const statusColors: Record<ArticleStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-warning/20 text-warning",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

export function ArticleTable({ articles }: { articles: ArticleRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    startTransition(async () => {
      await deleteArticleAction(id);
      router.refresh();
    });
  }

  function handleStatus(id: string, status: ArticleStatus) {
    startTransition(async () => {
      await updateStatusAction(id, status);
      router.refresh();
    });
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">No articles yet.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/articles/new">Write your first article</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Category</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Views</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/articles/${article.id}/edit`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {article.title}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {article.category.name}
              </td>
              <td className="px-4 py-3">
                <select
                  value={article.status}
                  onChange={(e) =>
                    handleStatus(article.id, e.target.value as ArticleStatus)
                  }
                  disabled={isPending}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[article.status]}`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {article.viewCount}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  {article.status === "PUBLISHED" && (
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

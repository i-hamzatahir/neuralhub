"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Trash2, X } from "lucide-react";
import {
  adminDeleteArticleAction,
  reviewArticleAction,
  toggleFeaturedAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import type { ArticleStatus } from "@/generated/prisma/client";

interface AdminArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  isFeatured: boolean;
  scheduledAt: Date | null;
  updatedAt: Date;
  author: { name: string | null; username: string; email: string };
  category: { name: string };
}

const statusColors: Record<ArticleStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-warning/20 text-warning",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

export function AdminArticleTable({ articles }: { articles: AdminArticleRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No articles found.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Author</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.category.name}
                    {article.scheduledAt &&
                      ` · Scheduled ${article.scheduledAt.toLocaleString()}`}
                  </p>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {article.author.name ?? article.author.username}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[article.status]}`}
                >
                  {article.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  {article.status === "REVIEW" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        onClick={() =>
                          run(() => reviewArticleAction(article.id, "approve"))
                        }
                        title="Approve"
                      >
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        onClick={() =>
                          run(() => reviewArticleAction(article.id, "reject"))
                        }
                        title="Reject"
                      >
                        <X className="h-4 w-4 text-warning" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() =>
                      run(() =>
                        toggleFeaturedAction(article.id, !article.isFeatured),
                      )
                    }
                    title={article.isFeatured ? "Unfeature" : "Feature"}
                  >
                    <Star
                      className={`h-4 w-4 ${article.isFeatured ? "fill-primary text-primary" : ""}`}
                    />
                  </Button>
                  {article.status === "PUBLISHED" && (
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/articles/${article.slug}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm("Delete this article?")) return;
                      run(() => adminDeleteArticleAction(article.id));
                    }}
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

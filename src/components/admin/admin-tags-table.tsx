"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteTagAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

interface TagRow {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { articles: number };
}

export function AdminTagsTable({ tags }: { tags: TagRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete tag "${name}"? Articles will be unlinked.`)) return;
    startTransition(async () => {
      await deleteTagAction(id);
      router.refresh();
    });
  }

  if (tags.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No tags yet. Tags are created when authors add them to articles.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Tag</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Slug</th>
            <th className="px-4 py-3 text-left font-medium">Articles</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{tag.name}</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                /{tag.slug}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{tag._count.articles}</td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {tag.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(tag.id, tag.name)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

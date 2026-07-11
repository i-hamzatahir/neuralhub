"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { adminDeleteCommentAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

interface CommentRow {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; username: string };
  article: { title: string; slug: string };
}

export function AdminCommentsTable({ comments }: { comments: CommentRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      await adminDeleteCommentAction(id);
      router.refresh();
    });
  }

  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground">No comments to moderate.</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">
                {comment.author.name ?? comment.author.username}
              </span>
              <span className="text-muted-foreground">on</span>
              <Link
                href={`/articles/${comment.article.slug}#comments`}
                className="text-primary hover:underline"
              >
                {comment.article.title}
              </Link>
              <time className="text-xs text-muted-foreground">
                {comment.createdAt.toLocaleString()}
              </time>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{comment.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => handleDelete(comment.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

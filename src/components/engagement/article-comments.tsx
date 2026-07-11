"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Trash2 } from "lucide-react";
import {
  createCommentAction,
  deleteCommentAction,
  type EngagementActionResult,
} from "@/lib/actions/engagement";
import type { CommentWithAuthor } from "@/lib/services/engagement/engagement.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface ArticleCommentsProps {
  articleId: string;
  slug: string;
  comments: CommentWithAuthor[];
  currentUserId?: string;
  articleAuthorId: string;
  isLoggedIn: boolean;
}

export function ArticleComments({
  articleId,
  slug,
  comments,
  currentUserId,
  articleAuthorId,
  isLoggedIn,
}: ArticleCommentsProps) {
  const [state, formAction, pending] = useActionState<
    EngagementActionResult,
    FormData
  >(createCommentAction, { success: false });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <section id="comments" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <h2 className="text-display mb-6 flex items-center gap-2 text-xl font-semibold">
        <MessageCircle className="h-5 w-5" />
        Comments
        <span className="text-sm font-normal text-muted-foreground">
          ({comments.reduce((n, c) => n + 1 + c.replies.length, 0)})
        </span>
      </h2>

      {isLoggedIn ? (
        <form action={formAction} className="mb-8 space-y-3">
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="content"
            rows={3}
            placeholder="Share your thoughts..."
            required
            maxLength={2000}
            className={cn(
              "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          />
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Posting..." : "Post comment"}
          </Button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to share your perspective.
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              slug={slug}
              currentUserId={currentUserId}
              articleAuthorId={articleAuthorId}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  articleId,
  slug,
  currentUserId,
  articleAuthorId,
  isLoggedIn,
  isReply = false,
}: {
  comment: CommentWithAuthor;
  articleId: string;
  slug: string;
  currentUserId?: string;
  articleAuthorId: string;
  isLoggedIn: boolean;
  isReply?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    EngagementActionResult,
    FormData
  >(createCommentAction, { success: false });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const displayName = comment.author.name ?? comment.author.username;
  const avatar = comment.author.image ?? comment.author.avatar;
  const canDelete =
    currentUserId &&
    (comment.author.id === currentUserId ||
      articleAuthorId === currentUserId);

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    await deleteCommentAction(comment.id, slug);
    window.location.reload();
  }

  return (
    <li className={cn(!isReply && "border-b border-border pb-6 last:border-0")}>
      <div className="flex gap-3">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            {displayName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/authors/${comment.author.username}`}
              className="text-sm font-medium hover:text-primary"
            >
              {displayName}
            </Link>
            <time className="text-xs text-muted-foreground">
              {formatRelative(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center gap-3">
            {isLoggedIn && !isReply && (
              <button
                type="button"
                onClick={() => setReplyOpen(!replyOpen)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Reply
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
          </div>

          {replyOpen && isLoggedIn && (
            <form action={formAction} className="mt-3 space-y-2">
              <input type="hidden" name="articleId" value={articleId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="parentId" value={comment.id} />
              <textarea
                name="content"
                rows={2}
                placeholder="Write a reply..."
                required
                maxLength={2000}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {state.error && (
                <p className="text-xs text-destructive">{state.error}</p>
              )}
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Posting..." : "Reply"}
              </Button>
            </form>
          )}

          {comment.replies.length > 0 && (
            <ul className="mt-4 space-y-4 border-l-2 border-border pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  slug={slug}
                  currentUserId={currentUserId}
                  articleAuthorId={articleAuthorId}
                  isLoggedIn={isLoggedIn}
                  isReply
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

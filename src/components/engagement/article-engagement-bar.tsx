"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Heart } from "lucide-react";
import {
  toggleBookmarkAction,
  toggleLikeAction,
} from "@/lib/actions/engagement";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ArticleEngagementBarProps {
  articleId: string;
  slug: string;
  initialLikes: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}

export function ArticleEngagementBar({
  articleId,
  slug,
  initialLikes,
  initialLiked,
  initialBookmarked,
  isLoggedIn,
}: ArticleEngagementBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(articleId, slug);
      if (!result.success) {
        setLiked(!nextLiked);
        setLikes((c) => c + (nextLiked ? -1 : 1));
      } else if (result.liked !== undefined) {
        setLiked(result.liked);
      }
    });
  }

  function handleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);

    startTransition(async () => {
      const result = await toggleBookmarkAction(articleId, slug);
      if (!result.success) {
        setBookmarked(!next);
      } else if (result.bookmarked !== undefined) {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleLike}
          className={cn("gap-2", liked && "border-primary/40 text-primary")}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          {likes}
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/login" className="gap-2">
            <Heart className="h-4 w-4" />
            {likes}
          </Link>
        </Button>
      )}

      {isLoggedIn ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleBookmark}
          className={cn("gap-2", bookmarked && "border-primary/40 text-primary")}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          Save
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/login" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save
          </Link>
        </Button>
      )}
    </div>
  );
}

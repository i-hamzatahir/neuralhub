"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserPlus, UserMinus } from "lucide-react";
import { toggleFollowAction } from "@/lib/actions/engagement";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface FollowAuthorButtonProps {
  followingId: string;
  username: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  isSelf: boolean;
}

export function FollowAuthorButton({
  followingId,
  username,
  initialFollowing,
  isLoggedIn,
  isSelf,
}: FollowAuthorButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  if (isSelf) return null;

  function handleToggle() {
    if (!isLoggedIn) return;
    const next = !following;
    setFollowing(next);

    startTransition(async () => {
      const result = await toggleFollowAction(followingId, username);
      if (!result.success) {
        setFollowing(!next);
      } else if (result.following !== undefined) {
        setFollowing(result.following);
      }
    });
  }

  if (!isLoggedIn) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">
          <UserPlus className="h-4 w-4" />
          Follow
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={following ? "outline" : "default"}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={cn("gap-2", following && "border-primary/40")}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}

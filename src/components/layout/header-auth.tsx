"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { isPersonalSite } from "@/config/site-mode";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationBell } from "@/components/engagement/notification-bell";
import { Button } from "@/components/ui/button";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="hidden h-8 w-8 animate-shimmer rounded-full sm:block" />
    );
  }

  if (session?.user) {
    return (
      <div className="hidden items-center gap-1 sm:flex">
        <NotificationBell />
        <UserMenu user={session.user} />
      </div>
    );
  }

  if (isPersonalSite) {
    return null;
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/login">Log in</Link>
      </Button>
      <Button size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/register">Sign up</Link>
      </Button>
    </>
  );
}

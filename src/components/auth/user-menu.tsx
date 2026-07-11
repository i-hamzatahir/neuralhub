"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard, Shield, PenLine } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/actions/login";
import { getRoleLabel, canAccessDashboard, canAccessAdmin } from "@/lib/auth/policies";
import type { Role } from "@/generated/prisma/client";
import { cn } from "@/lib/utils/cn";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    username?: string;
    role: Role;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = (user.name ?? user.username ?? user.email ?? "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-ring"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-56 animate-slide-down",
            "rounded-xl border border-border bg-popover p-2 shadow-lg",
          )}
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name ?? user.username}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {getRoleLabel(user.role)}
            </span>
          </div>

          <div className="py-1">
            {user.role === "USER" && (
              <MenuLink href="/write" icon={PenLine} onClick={() => setOpen(false)}>
                Start writing
              </MenuLink>
            )}
            {canAccessDashboard(user) && (
              <MenuLink href="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>
                Dashboard
              </MenuLink>
            )}
            {canAccessAdmin(user) && (
              <MenuLink href="/admin" icon={Shield} onClick={() => setOpen(false)}>
                Admin
              </MenuLink>
            )}
          </div>

          <div className="border-t border-border pt-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

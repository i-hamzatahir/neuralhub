"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import * as React from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { mainNav, topicNav } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HeaderAuth } from "@/components/layout/header-auth";
import { BrandLogo } from "@/components/layout/brand-logo";
import { isPersonalSite } from "@/config/site-mode";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationBell } from "@/components/engagement/notification-bell";
import { cn } from "@/lib/utils/cn";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function TopicsDropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Categories
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-2 shadow-md">
          {topicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="blog-container flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.title}
            </NavLink>
          ))}
          <TopicsDropdown />
          <NavLink href="/about">About</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/search" aria-label="Search articles">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <HeaderAuth />
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border md:hidden"
          aria-label="Mobile"
        >
          <div className="blog-container flex flex-col gap-1 py-4">
            {[...mainNav, ...topicNav, { title: "About", href: "/about" }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.title}
                </Link>
              ),
            )}
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Search
            </Link>
            <div className="mt-3 border-t border-border pt-3">
              {status === "loading" ? null : isLoggedIn ? (
                <div className="flex items-center gap-2 px-3">
                  <NotificationBell />
                  <UserMenu user={session.user} />
                </div>
              ) : isPersonalSite ? null : (
                <div className="flex flex-col gap-2 px-1">
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

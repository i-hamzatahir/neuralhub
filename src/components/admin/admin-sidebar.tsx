"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Shield,
  Settings,
  FolderOpen,
  Mail,
  Tag,
  Image,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const editorLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  {
    href: "/admin/articles?status=REVIEW",
    label: "Review queue",
    icon: FileText,
    matchQuery: "status=REVIEW",
  },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

const adminLinks = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/security", label: "Security logs", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function isActive(href: string, exact?: boolean, matchQuery?: string) {
    if (matchQuery) {
      return pathname === "/admin/articles" && query === matchQuery;
    }
    const base = href.split("?")[0];
    if (exact) return pathname === base;
    return pathname.startsWith(base);
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border lg:block">
      <div className="sticky top-16 p-4">
        <p className="text-label mb-4 px-3">Admin</p>
        <nav className="flex flex-col gap-1">
          {editorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href, link.exact, link.matchQuery)
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}

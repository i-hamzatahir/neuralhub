import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";
import { brand } from "@/config/nav";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="mx-auto flex w-full max-w-md items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-display text-base font-semibold">{brand.name}</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}

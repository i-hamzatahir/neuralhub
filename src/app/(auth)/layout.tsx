import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/nav";
import { BrandLogo } from "@/components/layout/brand-logo";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b border-border bg-background px-4 py-4 sm:px-6">
        <BrandLogo className="mx-auto w-full max-w-md" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          ← Back to {brand.name}
        </Link>
      </footer>
    </div>
  );
}

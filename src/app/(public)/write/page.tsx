import Link from "next/link";
import { PenLine, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { becomeAuthorAction } from "@/lib/actions/author";
import { canAccessDashboard } from "@/lib/auth/policies";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { redirect } from "next/navigation";

export const metadata = buildPageMetadata({
  title: "Start Writing",
  description:
    "Become an author on NeuralHub and publish articles on AI, data science, and technology.",
  path: "/write",
});

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  verify_email: "Please verify your email before becoming an author.",
  rate_limit: "Too many attempts. Try again later.",
  not_found: "Account not found.",
};

export default async function WritePage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const session = await auth();

  if (session?.user && canAccessDashboard(session.user)) {
    redirect("/dashboard/articles/new");
  }

  let emailVerified = false;
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    emailVerified = !!user?.emailVerified;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:py-24">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PenLine className="h-7 w-7" />
      </div>
      <h1 className="text-display text-3xl font-semibold sm:text-4xl">
        Publish on NeuralHub
      </h1>
      <p className="text-body mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
        Share your expertise in AI, machine learning, data science, and
        technology with a global audience of researchers and engineers.
      </p>

      <div className="mt-10 space-y-4 text-left">
        {[
          "Write with a distraction-free editor and autosave",
          "Reach readers through categories, RSS, and search",
          "Track views and engagement from your dashboard",
        ].map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        {error && ERROR_MESSAGES[error] && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {ERROR_MESSAGES[error]}
          </p>
        )}
        {!session?.user ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Create an account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        ) : !emailVerified ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-sm text-muted-foreground">
              Verify your email before becoming an author. Check your inbox for
              the verification link.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/verify-email">Resend verification</Link>
            </Button>
          </div>
        ) : (
          <form action={becomeAuthorAction}>
            <Button type="submit" size="lg">
              Become an author
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

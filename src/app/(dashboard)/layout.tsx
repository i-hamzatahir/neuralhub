import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessDashboard } from "@/lib/auth/policies";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !canAccessDashboard(user)) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardShell>{children}</DashboardShell>;
}

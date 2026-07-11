import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessAdmin, canManageUsers } from "@/lib/auth/policies";
import { privateRouteMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privateRouteMetadata;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !canAccessAdmin(user)) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <AdminShell isAdmin={canManageUsers(user)}>{children}</AdminShell>
  );
}

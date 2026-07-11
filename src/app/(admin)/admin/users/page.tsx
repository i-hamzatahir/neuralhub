import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/auth/policies";
import { listUsers } from "@/lib/services/admin/admin.service";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user)) {
    redirect("/admin?error=unauthorized");
  }

  const { users } = await listUsers({ limit: 50 });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage roles and permissions
        </p>
      </header>
      <AdminUsersTable users={users} />
    </div>
  );
}

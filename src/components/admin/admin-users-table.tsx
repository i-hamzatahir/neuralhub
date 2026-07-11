"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/lib/actions/admin";
import { getRoleLabel } from "@/lib/auth/policies";
import type { Role } from "@/generated/prisma/client";

interface UserRow {
  id: string;
  name: string | null;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
  emailVerified: Date | null;
  _count: { articles: number };
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: Role) {
    startTransition(async () => {
      await updateUserRoleAction(userId, role);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">User</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Email</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Articles</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">{user.name ?? user.username}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {user.email}
              </td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  disabled={isPending}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as Role)
                  }
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  {(["USER", "AUTHOR", "EDITOR", "ADMIN"] as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {getRoleLabel(r)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {user._count.articles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

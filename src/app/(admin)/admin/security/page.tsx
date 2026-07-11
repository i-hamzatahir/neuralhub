import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/auth/policies";
import { listAuditLogs } from "@/lib/services/admin/admin.service";

export const metadata = { title: "Admin — Security" };

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminSecurityPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user)) {
    redirect("/admin?error=unauthorized");
  }

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { logs, total, pages } = await listAuditLogs({ page });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Security logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} audit event{total !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Entity</th>
              <th className="px-4 py-3 text-left font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.user?.name ?? log.user?.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.entityType}
                  {log.entityId && ` · ${log.entityId.slice(0, 8)}…`}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <p className="mt-4 text-sm text-muted-foreground">Page {page} of {pages}</p>
      )}
    </div>
  );
}

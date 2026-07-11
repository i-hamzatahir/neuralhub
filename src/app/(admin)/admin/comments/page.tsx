import { listAdminComments } from "@/lib/services/admin/admin.service";
import { AdminCommentsTable } from "@/components/admin/admin-comments-table";

export const metadata = { title: "Admin — Comments" };

export default async function AdminCommentsPage() {
  const comments = await listAdminComments(50);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate community discussions
        </p>
      </header>
      <AdminCommentsTable comments={comments} />
    </div>
  );
}

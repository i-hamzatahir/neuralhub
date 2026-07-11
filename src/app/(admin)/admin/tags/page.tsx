import { listAdminTags } from "@/lib/services/admin/admin.service";
import { AdminTagsTable } from "@/components/admin/admin-tags-table";

export const metadata = { title: "Admin — Tags" };

export default async function AdminTagsPage() {
  const tags = await listAdminTags();

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Tags</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage article tags and usage counts
        </p>
      </header>
      <AdminTagsTable tags={tags} />
    </div>
  );
}

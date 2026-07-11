import { listAdminMedia } from "@/lib/services/admin/admin.service";
import { AdminMediaTable } from "@/components/admin/admin-media-table";

export const metadata = { title: "Admin — Media" };

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { files, total, pages } = await listAdminMedia({ page });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Media library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} uploaded file{total !== 1 ? "s" : ""}
        </p>
      </header>
      <AdminMediaTable files={files} />
      {pages > 1 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Page {page} of {pages}
        </p>
      )}
    </div>
  );
}

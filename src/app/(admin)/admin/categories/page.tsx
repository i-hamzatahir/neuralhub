import { listAdminCategories } from "@/lib/services/admin/admin.service";
import { AdminCategoriesPanel } from "@/components/admin/admin-categories-panel";

export const metadata = { title: "Admin — Categories" };

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-display text-2xl font-semibold">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage article categories
        </p>
      </header>
      <AdminCategoriesPanel categories={categories} />
    </div>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type AdminActionResult,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  _count: { articles: number };
}

const initialState: AdminActionResult = { success: false };

function CategoryFormFields({
  category,
  prefix,
}: {
  category?: CategoryRow;
  prefix: string;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-name`} className="text-sm font-medium">
            Name
          </label>
          <Input
            id={`${prefix}-name`}
            name="name"
            defaultValue={category?.name ?? ""}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-slug`} className="text-sm font-medium">
            Slug
          </label>
          <Input
            id={`${prefix}-slug`}
            name="slug"
            defaultValue={category?.slug ?? ""}
            placeholder="auto-generated from name"
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${prefix}-description`} className="text-sm font-medium">
          Description
        </label>
        <textarea
          id={`${prefix}-description`}
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          className="mt-1.5 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-ring"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${prefix}-icon`} className="text-sm font-medium">
            Icon
          </label>
          <Input
            id={`${prefix}-icon`}
            name="icon"
            defaultValue={category?.icon ?? ""}
            placeholder="brain"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-color`} className="text-sm font-medium">
            Color
          </label>
          <Input
            id={`${prefix}-color`}
            name="color"
            defaultValue={category?.color ?? ""}
            placeholder="#8B5CF6"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-sortOrder`} className="text-sm font-medium">
            Sort order
          </label>
          <Input
            id={`${prefix}-sortOrder`}
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={category?.sortOrder ?? 0}
            className="mt-1.5"
          />
        </div>
      </div>
    </>
  );
}

function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-sm font-semibold">Create category</h2>
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Category created.
        </p>
      )}
      <CategoryFormFields prefix="create" />
      <Button type="submit" size="sm" loading={pending}>
        Create category
      </Button>
    </form>
  );
}

function EditCategoryForm({
  category,
  onCancel,
}: {
  category: CategoryRow;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateCategoryAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <input type="hidden" name="categoryId" value={category.id} />
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Category updated.
        </p>
      )}
      <CategoryFormFields category={category} prefix={`edit-${category.id}`} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={pending}>
          Save changes
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AdminCategoriesPanel({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(category: CategoryRow) {
    if (category._count.articles > 0) {
      alert("Reassign or remove articles before deleting this category.");
      return;
    }
    if (!confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.success && result.error) {
        alert(result.error);
      }
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <CreateCategoryForm />

      <div>
        <h2 className="mb-4 text-sm font-semibold">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {cat.color && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <p className="font-semibold">{cat.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                  {cat.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {cat._count.articles} article{cat._count.articles !== 1 ? "s" : ""}
                    {cat.icon ? ` · icon: ${cat.icon}` : ""}
                    {` · order: ${cat.sortOrder}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setEditingId(editingId === cat.id ? null : cat.id)
                    }
                  >
                    {editingId === cat.id ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {editingId === cat.id && (
                <EditCategoryForm
                  category={cat}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { canManageUsers, hasMinRole } from "@/lib/auth/policies";
import {
  adminDeleteArticle,
  createCategory,
  deleteCategory,
  deleteMediaFile,
  deleteTag,
  publishScheduledArticles,
  reviewArticle,
  setSiteSetting,
  toggleArticleFeatured,
  updateCategory,
  updateUserRole,
} from "@/lib/services/admin/admin.service";
import { deleteComment } from "@/lib/services/engagement/engagement.service";
import {
  categoryFormSchema,
  deleteCategorySchema,
  deleteMediaSchema,
  deleteTagSchema,
  reviewArticleSchema,
  siteSettingSchema,
  toggleFeaturedSchema,
  updateCategorySchema,
  updateUserRoleSchema,
} from "@/lib/validations/admin";

export type AdminActionResult = {
  success: boolean;
  error?: string;
};

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

function requireEditor() {
  return auth().then((session) => {
    if (!session?.user || !hasMinRole(session.user, "EDITOR")) {
      throw new Error("Unauthorized");
    }
    return session.user;
  });
}

function requireAdmin() {
  return auth().then((session) => {
    if (!session?.user || !canManageUsers(session.user)) {
      throw new Error("Unauthorized");
    }
    return session.user;
  });
}

export async function updateUserRoleAction(
  userId: string,
  role: string,
): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    const parsed = updateUserRoleSchema.safeParse({ userId, role });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const ip = await getClientIp();
    await updateUserRole(parsed.data.userId, parsed.data.role, admin.id, ip);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function reviewArticleAction(
  articleId: string,
  action: "approve" | "reject" | "archive",
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = reviewArticleSchema.safeParse({ articleId, action });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const article = await reviewArticle(
      parsed.data.articleId,
      parsed.data.action,
      editor.id,
    );

    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Review failed",
    };
  }
}

export async function toggleFeaturedAction(
  articleId: string,
  isFeatured: boolean,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = toggleFeaturedSchema.safeParse({ articleId, isFeatured });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const article = await toggleArticleFeatured(
      parsed.data.articleId,
      parsed.data.isFeatured,
      editor.id,
    );

    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update",
    };
  }
}

export async function adminDeleteArticleAction(
  articleId: string,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    await adminDeleteArticle(articleId, editor.id);
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function adminDeleteCommentAction(
  commentId: string,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    await deleteComment(commentId, editor.id, editor.role);
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function saveSiteSettingAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const admin = await requireAdmin();
    const parsed = siteSettingSchema.safeParse({
      key: formData.get("key"),
      value: formData.get("value"),
    });
    if (!parsed.success) return { success: false, error: "Invalid setting" };

    await setSiteSetting(parsed.data.key, parsed.data.value, admin.id);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save",
    };
  }
}

export async function saveSiteSettingFormAction(
  formData: FormData,
): Promise<void> {
  await saveSiteSettingAction({ success: false }, formData);
}

export async function runScheduledPublishAction(): Promise<void> {
  try {
    await requireEditor();
    await publishScheduledArticles();
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/articles");
  } catch {
    // ignore for form action
  }
}

export async function deleteTagAction(tagId: string): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = deleteTagSchema.safeParse({ tagId });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await deleteTag(parsed.data.tagId, editor.id);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function deleteMediaAction(
  mediaId: string,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = deleteMediaSchema.safeParse({ mediaId });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await deleteMediaFile(parsed.data.mediaId, editor.id);
    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

function parseCategoryFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
    icon: String(formData.get("icon") ?? "") || undefined,
    color: String(formData.get("color") ?? "") || undefined,
    sortOrder: formData.get("sortOrder")
      ? Number(formData.get("sortOrder"))
      : undefined,
  };
}

export async function createCategoryAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = categoryFormSchema.safeParse(parseCategoryFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    await createCategory(parsed.data, editor.id);
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategoryAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = updateCategorySchema.safeParse({
      categoryId: formData.get("categoryId"),
      ...parseCategoryFormData(formData),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { categoryId, ...data } = parsed.data;
    await updateCategory(categoryId, data, editor.id);
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<AdminActionResult> {
  try {
    const editor = await requireEditor();
    const parsed = deleteCategorySchema.safeParse({ categoryId });
    if (!parsed.success) return { success: false, error: "Invalid input" };

    await deleteCategory(parsed.data.categoryId, editor.id);
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

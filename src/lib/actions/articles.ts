"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import {
  deleteArticle,
  saveArticle,
  updateArticleStatus,
} from "@/lib/services/articles/article.service";
import {
  publishArticleSchema,
  saveArticleSchema,
} from "@/lib/validations/article";
import type { ArticleStatus } from "@/generated/prisma/client";

export type ArticleActionResult = {
  success: boolean;
  error?: string;
  articleId?: string;
};

function revalidateArticle(slug: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
  if (categorySlug) revalidatePath(`/${categorySlug}`);
}

export async function saveArticleAction(
  _prev: ArticleActionResult,
  formData: FormData,
): Promise<ArticleActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const raw = {
    id: (formData.get("id") as string) || undefined,
    title: formData.get("title"),
    slug: (formData.get("slug") as string) || undefined,
    excerpt: (formData.get("excerpt") as string) || undefined,
    content: formData.get("content"),
    coverImage: (formData.get("coverImage") as string) || undefined,
    categoryId: formData.get("categoryId"),
    tags,
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    canonicalUrl: (formData.get("canonicalUrl") as string) || undefined,
    ogImage: (formData.get("ogImage") as string) || undefined,
    status: (formData.get("status") as ArticleStatus) || "DRAFT",
    scheduledAt: (formData.get("scheduledAt") as string) || undefined,
    affiliateUrl: (formData.get("affiliateUrl") as string) || undefined,
    isSponsored: formData.get("isSponsored") === "on",
    isAffiliate: formData.get("isAffiliate") === "on",
  };

  const schema =
    raw.status === "PUBLISHED" ? publishArticleSchema : saveArticleSchema;
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (
    parsed.data.status === "PUBLISHED" &&
    !hasMinRole(session.user, "EDITOR")
  ) {
    return {
      success: false,
      error: "Publishing requires editor approval",
    };
  }

  try {
    const article = await saveArticle(
      parsed.data,
      session.user.id,
      session.user.role,
    );
    revalidateArticle(article.slug, article.category.slug);
    return { success: true, articleId: article.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save",
    };
  }
}

export async function autosaveArticleAction(
  data: {
    id?: string;
    title: string;
    content: string;
    categoryId: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
  },
): Promise<ArticleActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  const ip = getClientIpFromHeaders(await headers());
  const rateLimit = await rateLimitByIp(ip, "autosave", 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Autosave rate limit exceeded" };
  }

  const parsed = saveArticleSchema.safeParse({
    ...data,
    status: "DRAFT",
    tags: data.tags ?? [],
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid draft data" };
  }

  try {
    const article = await saveArticle(
      { ...parsed.data, status: "DRAFT" },
      session.user.id,
      session.user.role,
    );
    return { success: true, articleId: article.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Autosave failed",
    };
  }
}

export async function deleteArticleAction(
  id: string,
): Promise<ArticleActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteArticle(id, session.user.id);
    revalidatePath("/dashboard/articles");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function updateStatusAction(
  id: string,
  status: ArticleStatus,
): Promise<ArticleActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return { success: false, error: "Unauthorized" };
  }

  if (status === "PUBLISHED" && !hasMinRole(session.user, "EDITOR")) {
    return { success: false, error: "Publishing requires editor approval" };
  }

  try {
    const article = await updateArticleStatus(
      id,
      status,
      session.user.id,
      session.user.role,
    );
    revalidateArticle(article.slug, article.category.slug);
    revalidatePath("/dashboard/articles");
    return { success: true, articleId: article.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Status update failed",
    };
  }
}

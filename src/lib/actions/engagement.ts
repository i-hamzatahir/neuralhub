"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import {
  createComment,
  deleteComment,
  markAllNotificationsRead,
  markNotificationRead,
  toggleBookmark,
  toggleFollow,
  toggleLike,
} from "@/lib/services/engagement/engagement.service";
import {
  articleIdSchema,
  commentSchema,
  followUserSchema,
} from "@/lib/validations/engagement";

export type EngagementActionResult = {
  success: boolean;
  error?: string;
};

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Sign in required");
  return session.user;
}

export async function toggleLikeAction(
  articleId: string,
  slug: string,
): Promise<EngagementActionResult & { liked?: boolean }> {
  try {
    const user = await requireUser();
    const ip = await getClientIp();
    const rateLimit = await rateLimitByIp(ip, "toggle-like", 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many requests" };
    }

    const parsed = articleIdSchema.safeParse({ articleId });
    if (!parsed.success) return { success: false, error: "Invalid article" };

    const result = await toggleLike(articleId, user.id);
    revalidatePath(`/articles/${slug}`);
    return { success: true, liked: result.liked };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like",
    };
  }
}

export async function toggleBookmarkAction(
  articleId: string,
  slug: string,
): Promise<EngagementActionResult & { bookmarked?: boolean }> {
  try {
    const user = await requireUser();
    const ip = await getClientIp();
    const rateLimit = await rateLimitByIp(ip, "toggle-bookmark", 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many requests" };
    }

    const parsed = articleIdSchema.safeParse({ articleId });
    if (!parsed.success) return { success: false, error: "Invalid article" };

    const result = await toggleBookmark(articleId, user.id);
    revalidatePath(`/articles/${slug}`);
    revalidatePath("/dashboard/bookmarks");
    return { success: true, bookmarked: result.bookmarked };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to bookmark",
    };
  }
}

export async function toggleFollowAction(
  followingId: string,
  username: string,
): Promise<EngagementActionResult & { following?: boolean }> {
  try {
    const user = await requireUser();
    const ip = await getClientIp();
    const rateLimit = await rateLimitByIp(ip, "toggle-follow", 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many requests" };
    }

    const parsed = followUserSchema.safeParse({ followingId });
    if (!parsed.success) return { success: false, error: "Invalid user" };

    const result = await toggleFollow(user.id, followingId);
    revalidatePath(`/authors/${username}`);
    return { success: true, following: result.following };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to follow",
    };
  }
}

export async function createCommentAction(
  _prev: EngagementActionResult,
  formData: FormData,
): Promise<EngagementActionResult> {
  try {
    const user = await requireUser();
    const ip = await getClientIp();
    const rateLimit = await rateLimitByIp(ip, "create-comment", 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return { success: false, error: "Too many comments. Try again later." };
    }

    const raw = {
      articleId: formData.get("articleId"),
      content: formData.get("content"),
      parentId: (formData.get("parentId") as string) || undefined,
    };

    const parsed = commentSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid comment",
      };
    }

    const slug = formData.get("slug") as string;
    await createComment(
      parsed.data.articleId,
      user.id,
      parsed.data.content,
      parsed.data.parentId,
    );

    if (slug) revalidatePath(`/articles/${slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to post comment",
    };
  }
}

export async function deleteCommentAction(
  commentId: string,
  slug: string,
): Promise<EngagementActionResult> {
  try {
    const user = await requireUser();
    await deleteComment(commentId, user.id, user.role);
    revalidatePath(`/articles/${slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete",
    };
  }
}

export async function markNotificationReadAction(
  id: string,
): Promise<EngagementActionResult> {
  try {
    const user = await requireUser();
    await markNotificationRead(id, user.id);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markNotificationReadFormAction(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  await markNotificationReadAction(id);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  try {
    const user = await requireUser();
    await markAllNotificationsRead(user.id);
    revalidatePath("/dashboard/notifications");
  } catch {
    // ignore
  }
}

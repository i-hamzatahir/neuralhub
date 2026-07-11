import { z } from "zod";
import type { Role } from "@/generated/prisma/client";

export const roleEnum = z.enum(["USER", "AUTHOR", "EDITOR", "ADMIN"]);

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleEnum,
});

export const reviewArticleSchema = z.object({
  articleId: z.string().min(1),
  action: z.enum(["approve", "reject", "archive"]),
});

export const siteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
});

export const toggleFeaturedSchema = z.object({
  articleId: z.string().min(1),
  isFeatured: z.boolean(),
});

export const deleteTagSchema = z.object({
  tagId: z.string().min(1),
});

export const deleteMediaSchema = z.object({
  mediaId: z.string().min(1),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export const updateCategorySchema = categoryFormSchema.extend({
  categoryId: z.string().min(1),
});

export const deleteCategorySchema = z.object({
  categoryId: z.string().min(1),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ReviewArticleInput = z.infer<typeof reviewArticleSchema>;

export const ADMIN_ROLES: Role[] = ["EDITOR", "ADMIN"];

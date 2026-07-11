import { z } from "zod";

export const commentSchema = z.object({
  articleId: z.string().min(1),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
  parentId: z.string().optional(),
});

export const articleIdSchema = z.object({
  articleId: z.string().min(1),
});

export const followUserSchema = z.object({
  followingId: z.string().min(1),
});

export const viewReadTimeSchema = z.object({
  viewId: z.string().min(1),
  viewToken: z.string().min(1),
  readTime: z.number().int().min(0).max(86400),
});

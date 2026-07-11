import { z } from "zod";

export const articleStatusEnum = z.enum([
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export const saveArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).max(10).default([]),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  affiliateUrl: z.string().url().optional().or(z.literal("")),
  isSponsored: z.boolean().optional(),
  isAffiliate: z.boolean().optional(),
  status: articleStatusEnum.default("DRAFT"),
});

export const publishArticleSchema = saveArticleSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
});

export type SaveArticleInput = z.infer<typeof saveArticleSchema>;

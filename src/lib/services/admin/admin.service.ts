import type { ArticleStatus, Prisma, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/auth/audit";
import { articleInclude } from "@/lib/services/articles/article.service";
import { createNotification } from "@/lib/services/engagement/engagement.service";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";

export async function getPlatformStats() {
  const [
    totalUsers,
    totalArticles,
    publishedArticles,
    reviewQueue,
    totalComments,
    totalViews,
    scheduledCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "REVIEW" } }),
    prisma.comment.count({ where: { isDeleted: false } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({
      where: {
        scheduledAt: { gt: new Date() },
        status: { in: ["DRAFT", "REVIEW"] },
      },
    }),
  ]);

  return {
    totalUsers,
    totalArticles,
    publishedArticles,
    reviewQueue,
    totalComments,
    totalViews: totalViews._sum.viewCount ?? 0,
    scheduledCount,
  };
}

export async function listUsers({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        _count: { select: { articles: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pages: Math.ceil(total / limit) };
}

export async function updateUserRole(
  userId: string,
  role: Role,
  adminId: string,
  ipAddress?: string,
) {
  if (userId === adminId) {
    throw new Error("You cannot change your own role");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const previousRole = user.role;

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await createAuditLog({
    action: "USER_ROLE_CHANGE",
    userId: adminId,
    entityType: "User",
    entityId: userId,
    metadata: { from: previousRole, to: role, targetEmail: user.email },
    ipAddress,
  });
}

export async function listAdminArticles({
  status,
  page = 1,
  limit = 20,
}: {
  status?: ArticleStatus;
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, pages: Math.ceil(total / limit) };
}

export async function reviewArticle(
  articleId: string,
  action: "approve" | "reject" | "archive",
  editorId: string,
) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { author: { select: { id: true, username: true } } },
  });

  if (!article) throw new Error("Article not found");

  let status: ArticleStatus;
  let publishedAt = article.publishedAt;

  if (action === "approve") {
    status = "PUBLISHED";
    if (!publishedAt) publishedAt = new Date();
  } else if (action === "reject") {
    status = "DRAFT";
  } else {
    status = "ARCHIVED";
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { status, publishedAt },
    include: articleInclude,
  });

  await createAuditLog({
    action: action === "approve" ? "ARTICLE_PUBLISH" : "ARTICLE_UPDATE",
    userId: editorId,
    entityType: "Article",
    entityId: articleId,
    metadata: { reviewAction: action, title: article.title },
  });

  if (action === "approve" && article.authorId !== editorId) {
    await createNotification({
      userId: article.authorId,
      type: "ARTICLE_PUBLISHED",
      title: "Article published",
      message: `Your article "${article.title}" has been approved and published.`,
      link: `/articles/${updated.slug}`,
    });
  } else if (action === "reject") {
    await createNotification({
      userId: article.authorId,
      type: "ARTICLE_APPROVED",
      title: "Article needs changes",
      message: `Your article "${article.title}" was returned to draft. Please revise and resubmit.`,
      link: `/dashboard/articles/${articleId}/edit`,
    });
  }

  return updated;
}

export async function toggleArticleFeatured(
  articleId: string,
  isFeatured: boolean,
  editorId: string,
) {
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { isFeatured },
    include: articleInclude,
  });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "Article",
    entityId: articleId,
    metadata: { isFeatured, title: article.title },
  });

  return article;
}

export async function adminDeleteArticle(articleId: string, adminId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("Article not found");

  await prisma.article.delete({ where: { id: articleId } });

  await createAuditLog({
    action: "ARTICLE_DELETE",
    userId: adminId,
    entityType: "Article",
    entityId: articleId,
    metadata: { title: article.title, slug: article.slug },
  });
}

export async function listAdminComments(limit = 50) {
  return prisma.comment.findMany({
    where: { isDeleted: false },
    include: {
      author: { select: { id: true, name: true, username: true, email: true } },
      article: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listAuditLogs({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}

const DEFAULT_SETTINGS: Record<string, Prisma.InputJsonValue> = {
  "site.maintenance_mode": false,
  "site.registration_enabled": true,
  "site.announcement": "",
};

export async function getSiteSettingsMap() {
  const rows = await prisma.siteSettings.findMany();
  const map: Record<string, string> = {};

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    map[key] = String(value);
  }

  for (const row of rows) {
    map[row.key] =
      typeof row.value === "string" ? row.value : JSON.stringify(row.value);
  }

  return map;
}

export async function setSiteSetting(key: string, value: string, adminId: string) {
  let parsed: Prisma.InputJsonValue = value;
  if (value === "true") parsed = true;
  else if (value === "false") parsed = false;
  else if (!Number.isNaN(Number(value)) && value.trim() !== "") {
    parsed = Number(value);
  }

  await prisma.siteSettings.upsert({
    where: { key },
    update: { value: parsed },
    create: { key, value: parsed },
  });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: adminId,
    entityType: "SiteSettings",
    entityId: key,
    metadata: { value: parsed },
  });
}

export async function notifyEditorsArticleInReview(article: {
  id: string;
  title: string;
  slug: string;
  author: { name: string | null; username: string };
}) {
  const editors = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "ADMIN"] } },
    select: { id: true },
  });

  const authorName = article.author.name ?? article.author.username;

  await Promise.all(
    editors.map((editor) =>
      createNotification({
        userId: editor.id,
        type: "SYSTEM",
        title: "Article awaiting review",
        message: `${authorName} submitted "${article.title}" for review.`,
        link: `/admin/articles?status=REVIEW`,
      }),
    ),
  );
}

export async function publishScheduledArticles() {
  const due = await prisma.article.findMany({
    where: {
      scheduledAt: { lte: new Date() },
      status: { in: ["DRAFT", "REVIEW"] },
    },
    include: { author: { select: { id: true } } },
  });

  for (const article of due) {
    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        status: "PUBLISHED",
        publishedAt: article.scheduledAt ?? new Date(),
        scheduledAt: null,
      },
    });

    await createNotification({
      userId: article.authorId,
      type: "ARTICLE_PUBLISHED",
      title: "Article published",
      message: `Your scheduled article "${article.title}" is now live.`,
      link: `/articles/${updated.slug}`,
    });
  }

  return due.length;
}

export async function listAdminTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });
}

export async function deleteTag(tagId: string, editorId: string) {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new Error("Tag not found");

  await prisma.tag.delete({ where: { id: tagId } });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "Tag",
    entityId: tagId,
    metadata: { name: tag.name, slug: tag.slug },
  });
}

export async function listAdminMedia({
  page = 1,
  limit = 30,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    prisma.mediaFile.findMany({
      include: {
        uploader: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mediaFile.count(),
  ]);

  return { files, total, pages: Math.ceil(total / limit) };
}

export async function deleteMediaFile(mediaId: string, editorId: string) {
  const file = await prisma.mediaFile.findUnique({ where: { id: mediaId } });
  if (!file) throw new Error("Media file not found");

  await prisma.mediaFile.delete({ where: { id: mediaId } });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "MediaFile",
    entityId: mediaId,
    metadata: { filename: file.filename, url: file.url },
  });
}

export async function getPlatformAnalytics() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    eventCounts,
    referrerGroups,
    totalEvents,
    totalArticleViews,
    eventsLast7Days,
    viewsLast7Days,
    eventsLast30Days,
    viewsLast30Days,
  ] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["event"],
      _count: { _all: true },
      orderBy: { _count: { event: "desc" } },
    }),
    prisma.articleView.groupBy({
      by: ["referrer"],
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 15,
    }),
    prisma.analyticsEvent.count(),
    prisma.articleView.count(),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.articleView.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.articleView.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  const referrers = referrerGroups.map((row) => ({
    referrer: row.referrer ?? "(direct)",
    count: row._count._all,
  }));

  return {
    eventCounts: eventCounts.map((row) => ({
      event: row.event,
      count: row._count._all,
    })),
    referrers,
    totalEvents,
    totalArticleViews,
    eventsLast7Days,
    viewsLast7Days,
    eventsLast30Days,
    viewsLast30Days,
  };
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

async function ensureUniqueCategorySlug(slug: string, excludeId?: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw new Error("A category with this slug already exists");
  }
  return slug;
}

export async function createCategory(
  input: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
  },
  editorId: string,
) {
  const slug = input.slug
    ? await ensureUniqueCategorySlug(slugify(input.slug))
    : await generateUniqueSlug(input.name, async (s) => {
        const existing = await prisma.category.findUnique({ where: { slug: s } });
        return !!existing;
      });

  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
      color: input.color?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
    },
    include: { _count: { select: { articles: true } } },
  });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "Category",
    entityId: category.id,
    metadata: { name: category.name, slug: category.slug },
  });

  return category;
}

export async function updateCategory(
  categoryId: string,
  input: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
  },
  editorId: string,
) {
  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) throw new Error("Category not found");

  const slug = input.slug
    ? await ensureUniqueCategorySlug(slugify(input.slug), categoryId)
    : existing.slug;

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
      color: input.color?.trim() || null,
      sortOrder: input.sortOrder ?? existing.sortOrder,
    },
    include: { _count: { select: { articles: true } } },
  });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "Category",
    entityId: categoryId,
    metadata: { name: category.name, slug: category.slug },
  });

  return category;
}

export async function deleteCategory(categoryId: string, editorId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { articles: true } } },
  });
  if (!category) throw new Error("Category not found");
  if (category._count.articles > 0) {
    throw new Error("Cannot delete a category that has articles");
  }

  await prisma.category.delete({ where: { id: categoryId } });

  await createAuditLog({
    action: "ADMIN_ACTION",
    userId: editorId,
    entityType: "Category",
    entityId: categoryId,
    metadata: { name: category.name, slug: category.slug },
  });
}

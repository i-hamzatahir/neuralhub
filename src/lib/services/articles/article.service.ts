import type { Article, ArticleStatus, Category, Role, Tag, User } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { sanitizeArticleContent } from "@/lib/security/article-content";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import {
  calculateReadingTime,
  extractExcerpt,
} from "@/lib/utils/reading-time";
import type { SaveArticleInput } from "@/lib/validations/article";
import { buildArticleSearchText } from "@/lib/utils/search-text";
import { notifyEditorsArticleInReview } from "@/lib/services/admin/admin.service";
import { generateArticleSummary, generateArticleEmbedding, isAiEnabled, suggestArticleTags } from "@/lib/services/ai/ai.service";
import { extractTextFromTipTap } from "@/lib/utils/reading-time";
import { createAuditLog } from "@/lib/auth/audit";
import { trackEvent } from "@/lib/services/analytics/analytics.service";

export type ArticleWithRelations = Article & {
  author: Pick<User, "id" | "name" | "username" | "avatar" | "image" | "bio">;
  category: Category;
  tags: { tag: Tag }[];
};

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatar: true,
  image: true,
  bio: true,
} as const;

export const articleInclude = {
  author: { select: authorSelect },
  category: true,
  tags: { include: { tag: true } },
} as const;

export async function getArticleById(id: string, authorId?: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });
  if (!article) return null;
  if (authorId && article.authorId !== authorId) return null;
  return article;
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: articleInclude,
  });
}

export async function listPublishedArticles({
  page = 1,
  limit = 12,
  categorySlug,
  tagSlug,
  authorId,
  featured,
  sort = "publishedAt",
}: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  featured?: boolean;
  sort?: "publishedAt" | "viewCount";
} = {}) {
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    ...(featured && { isFeatured: true }),
    ...(authorId && { authorId }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
  };

  const orderBy =
    sort === "viewCount"
      ? [{ viewCount: "desc" as const }, { publishedAt: "desc" as const }]
      : { publishedAt: "desc" as const };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, pages: Math.ceil(total / limit) };
}

export async function listTrendingArticles(limit = 4) {
  return listPublishedArticles({ limit, sort: "viewCount" });
}

export type CategorySectionPreview = {
  category: Category;
  latest: ArticleWithRelations[];
  popular: ArticleWithRelations[];
};

export async function listCategorySectionPreviews(limitPerList = 4) {
  const categories = await getCategories();

  const sections = await Promise.all(
    categories.map(async (category) => {
      const [latest, popular] = await Promise.all([
        listPublishedArticles({
          categorySlug: category.slug,
          limit: limitPerList,
          sort: "publishedAt",
        }),
        listPublishedArticles({
          categorySlug: category.slug,
          limit: limitPerList,
          sort: "viewCount",
        }),
      ]);

      return {
        category,
        latest: latest.articles,
        popular: popular.articles,
      };
    }),
  );

  return sections.filter(
    (section) => section.latest.length > 0 || section.popular.length > 0,
  );
}

export async function listAuthorArticles(
  authorId: string,
  status?: ArticleStatus,
) {
  return prisma.article.findMany({
    where: {
      authorId,
      ...(status && { status }),
    },
    include: articleInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertTags(tagNames: string[]) {
  const tags = [];
  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;
    const slug = slugify(trimmed);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: trimmed, slug },
    });
    tags.push(tag);
  }
  return tags;
}

export async function saveArticle(
  input: SaveArticleInput,
  authorId: string,
  actorRole: Role,
) {
  const sanitizedContent = sanitizeArticleContent(input.content);
  const readingTime = calculateReadingTime(sanitizedContent);
  const excerpt = input.excerpt || extractExcerpt(sanitizedContent);

  let slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (!slug) slug = "untitled";

  if (input.id) {
    const existing = await prisma.article.findUnique({ where: { id: input.id } });
    if (!existing || existing.authorId !== authorId) {
      throw new Error("Article not found");
    }
    slug = input.slug ? slugify(input.slug) : existing.slug;
  } else {
    slug = await generateUniqueSlug(input.title, async (s) => {
      const existing = await prisma.article.findUnique({ where: { slug: s } });
      return !!existing;
    });
  }

  let tagList = input.tags;
  const now = new Date();
  const scheduledAt =
    input.scheduledAt?.trim() ? new Date(input.scheduledAt) : null;

  let status = input.status;
  let shouldPublishNow = status === "PUBLISHED";

  if (
    status === "PUBLISHED" &&
    actorRole !== "EDITOR" &&
    actorRole !== "ADMIN"
  ) {
    throw new Error("Publishing requires editor approval");
  }

  if (scheduledAt && scheduledAt > now) {
    shouldPublishNow = false;
    if (status === "PUBLISHED") status = "DRAFT";
  }

  const contentText = extractTextFromTipTap(sanitizedContent);

  let aiSummary: string | null | undefined = undefined;
  let embedding: number[] | null | undefined = undefined;

  if (shouldPublishNow && isAiEnabled()) {
    try {
      aiSummary = await generateArticleSummary(input.title, contentText);
      embedding = await generateArticleEmbedding(`${input.title}\n\n${contentText}`);
      if (tagList.length === 0) {
        tagList = await suggestArticleTags(input.title, contentText);
      }
    } catch {
      // AI assists are optional
    }
  }

  const tags = await upsertTags(tagList);

  const searchText = buildArticleSearchText({
    title: input.title,
    excerpt,
    content: sanitizedContent,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  });

  const data = {
    title: input.title,
    slug,
    excerpt,
    content: sanitizedContent,
    contentFormat: "json",
    coverImage: input.coverImage || null,
    categoryId: input.categoryId,
    readingTime,
    searchText,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImage: input.ogImage || null,
    affiliateUrl: input.affiliateUrl || null,
    isSponsored: input.isSponsored ?? false,
    isAffiliate: input.isAffiliate ?? false,
    status,
    scheduledAt,
    publishedAt: shouldPublishNow ? now : undefined,
    ...(aiSummary !== undefined ? { aiSummary } : {}),
    ...(embedding ? { embedding } : {}),
  };

  if (input.id) {
    const existing = await prisma.article.findUnique({
      where: { id: input.id },
    });
    if (!existing) throw new Error("Article not found");

    if (existing.status !== "PUBLISHED" && shouldPublishNow) {
      Object.assign(data, { publishedAt: now });
    } else if (existing.status === "PUBLISHED" && !shouldPublishNow) {
      delete (data as { publishedAt?: Date }).publishedAt;
    } else if (!shouldPublishNow) {
      delete (data as { publishedAt?: Date }).publishedAt;
    }

    await prisma.articleTag.deleteMany({ where: { articleId: input.id } });

    const article = await prisma.article.update({
      where: { id: input.id },
      data: {
        ...data,
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: articleInclude,
    });

    if (article.status === "REVIEW" && existing.status !== "REVIEW") {
      await notifyEditorsArticleInReview(article);
    }

    await createAuditLog({
      action: "ARTICLE_UPDATE",
      userId: authorId,
      entityType: "Article",
      entityId: article.id,
      metadata: { title: article.title, status: article.status },
    });

    if (shouldPublishNow && existing.status !== "PUBLISHED") {
      await createAuditLog({
        action: "ARTICLE_PUBLISH",
        userId: authorId,
        entityType: "Article",
        entityId: article.id,
        metadata: { title: article.title, slug: article.slug },
      });
      await trackEvent("article.published", {
        userId: authorId,
        properties: { articleId: article.id, slug: article.slug },
      });
    }

    return article;
  }

  const article = await prisma.article.create({
    data: {
      ...data,
      authorId,
      publishedAt: shouldPublishNow ? now : null,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: articleInclude,
  });

  if (article.status === "REVIEW") {
    await notifyEditorsArticleInReview(article);
  }

  await createAuditLog({
    action: "ARTICLE_CREATE",
    userId: authorId,
    entityType: "Article",
    entityId: article.id,
    metadata: { title: article.title, status: article.status },
  });

  if (shouldPublishNow) {
    await createAuditLog({
      action: "ARTICLE_PUBLISH",
      userId: authorId,
      entityType: "Article",
      entityId: article.id,
      metadata: { title: article.title, slug: article.slug },
    });
    await trackEvent("article.published", {
      userId: authorId,
      properties: { articleId: article.id, slug: article.slug },
    });
  }

  return article;
}

export async function deleteArticle(id: string, authorId: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.authorId !== authorId) {
    throw new Error("Article not found");
  }
  await prisma.article.delete({ where: { id } });

  await createAuditLog({
    action: "ARTICLE_DELETE",
    userId: authorId,
    entityType: "Article",
    entityId: id,
    metadata: { title: article.title, slug: article.slug },
  });
}

export async function updateArticleStatus(
  id: string,
  status: ArticleStatus,
  userId: string,
  userRole: string,
) {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new Error("Article not found");

  const isOwner = article.authorId === userId;
  const isEditor = userRole === "EDITOR" || userRole === "ADMIN";

  if (!isOwner && !isEditor) throw new Error("Unauthorized");

  if (status === "PUBLISHED" && !isEditor) {
    throw new Error("Publishing requires editor approval");
  }

  const data: { status: ArticleStatus; publishedAt?: Date | null } = { status };

  if (status === "PUBLISHED" && !article.publishedAt) {
    data.publishedAt = new Date();
  }
  if (status !== "PUBLISHED") {
    data.publishedAt = article.publishedAt;
  }

  const updated = await prisma.article.update({
    where: { id },
    data,
    include: articleInclude,
  });

  await createAuditLog({
    action: status === "PUBLISHED" ? "ARTICLE_PUBLISH" : "ARTICLE_UPDATE",
    userId,
    entityType: "Article",
    entityId: id,
    metadata: { title: updated.title, status, from: article.status },
  });

  if (status === "PUBLISHED" && article.status !== "PUBLISHED") {
    await trackEvent("article.published", {
      userId,
      properties: { articleId: id, slug: updated.slug },
    });
  }

  return updated;
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getAuthorByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      image: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function getAuthorStats(authorId: string) {
  const [totalArticles, publishedArticles, totalViews, drafts] =
    await Promise.all([
      prisma.article.count({ where: { authorId } }),
      prisma.article.count({ where: { authorId, status: "PUBLISHED" } }),
      prisma.article.aggregate({
        where: { authorId },
        _sum: { viewCount: true },
      }),
      prisma.article.count({ where: { authorId, status: "DRAFT" } }),
    ]);

  return {
    totalArticles,
    publishedArticles,
    totalViews: totalViews._sum.viewCount ?? 0,
    drafts,
  };
}

export async function getArticleAnalytics(authorId: string) {
  const articles = await prisma.article.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewCount: true,
      publishedAt: true,
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
    orderBy: { viewCount: "desc" },
    take: 10,
  });

  const viewsLast7Days = await prisma.articleView.count({
    where: {
      article: { authorId },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const uniqueReaders = await prisma.articleView.groupBy({
    by: ["userId"],
    where: {
      article: { authorId },
      userId: { not: null },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const referrers = await prisma.articleView.groupBy({
    by: ["referrer"],
    where: {
      article: { authorId },
      referrer: { not: null },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: 10,
  });

  return {
    topArticles: articles,
    viewsLast7Days,
    uniqueReaders: uniqueReaders.length,
    referrers: referrers.map((r) => ({
      referrer: r.referrer ?? "Direct",
      count: r._count.referrer,
    })),
  };
}

export async function recordArticleView(
  articleId: string,
  userId?: string,
  referrer?: string,
) {
  await prisma.$transaction([
    prisma.articleView.create({
      data: { articleId, userId, referrer },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  limit = 3,
) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      categoryId,
      id: { not: articleId },
    },
    include: articleInclude,
    orderBy: { viewCount: "desc" },
    take: limit,
  });
}

export async function listPublishedArticleSlugs() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function listAuthorsForSitemap() {
  return prisma.user.findMany({
    where: {
      articles: { some: { status: "PUBLISHED" } },
    },
    select: { username: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listPublishedArticlesForFeed(limit = 50) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true, username: true } },
      category: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export type AuthorProfile = {
  id: string;
  name: string | null;
  username: string;
  avatar: string | null;
  image: string | null;
  bio: string | null;
  role: Role;
  _count: { articles: number };
};

export async function listFeaturedAuthors(limit = 6): Promise<AuthorProfile[]> {
  const authors = await prisma.user.findMany({
    where: {
      articles: { some: { status: "PUBLISHED" } },
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      image: true,
      bio: true,
      role: true,
      _count: {
        select: { articles: { where: { status: "PUBLISHED" } } },
      },
    },
    take: limit * 3,
  });

  return authors
    .sort((a, b) => b._count.articles - a._count.articles)
    .slice(0, limit)
    .map((author) => ({
      ...author,
      _count: { articles: author._count.articles },
    }));
}

export async function listAuthorsWithPublishedArticles({
  page = 1,
  limit = 24,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const where = {
    articles: { some: { status: "PUBLISHED" as const } },
  };

  const [authors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        image: true,
        bio: true,
        role: true,
        _count: {
          select: { articles: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    authors: authors.map((author) => ({
      ...author,
      _count: { articles: author._count.articles },
    })),
    total,
    pages: Math.ceil(total / limit),
  };
}

export type CalendarArticle = {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
};

export async function listAuthorCalendarArticles(
  authorId: string,
): Promise<CalendarArticle[]> {
  return prisma.article.findMany({
    where: {
      authorId,
      OR: [
        { scheduledAt: { not: null } },
        { publishedAt: { not: null } },
        { status: { in: ["DRAFT", "REVIEW"] } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      scheduledAt: true,
      publishedAt: true,
    },
    orderBy: [{ scheduledAt: "asc" }, { publishedAt: "desc" }],
  });
}

import type { NotificationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatar: true,
  image: true,
} as const;

export type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  author: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
    image: string | null;
  };
  replies: CommentWithAuthor[];
};

export async function getArticleEngagementStats(
  articleId: string,
  userId?: string,
) {
  const [likeCount, bookmarkCount, commentCount, userLike, userBookmark] =
    await Promise.all([
      prisma.like.count({ where: { articleId } }),
      prisma.bookmark.count({ where: { articleId } }),
      prisma.comment.count({
        where: { articleId, isDeleted: false, parentId: null },
      }),
      userId
        ? prisma.like.findUnique({
            where: { userId_articleId: { userId, articleId } },
          })
        : null,
      userId
        ? prisma.bookmark.findUnique({
            where: { userId_articleId: { userId, articleId } },
          })
        : null,
    ]);

  return {
    likeCount,
    bookmarkCount,
    commentCount,
    liked: !!userLike,
    bookmarked: !!userBookmark,
  };
}

export async function toggleLike(articleId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, title: true, slug: true },
  });

  await prisma.like.create({ data: { userId, articleId } });

  if (article && article.authorId !== userId) {
    await createNotification({
      userId: article.authorId,
      type: "LIKE",
      title: "New like on your article",
      message: `Someone liked "${article.title}"`,
      link: `/articles/${article.slug}`,
    });
  }

  return { liked: true };
}

export async function toggleBookmark(articleId: string, userId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, articleId } });
  return { bookmarked: true };
}

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  const following = await prisma.user.findUnique({
    where: { id: followingId },
    select: { username: true },
  });

  await prisma.follow.create({ data: { followerId, followingId } });

  await createNotification({
    userId: followingId,
    type: "FOLLOW",
    title: "New follower",
    message: "Someone started following you",
    link: following ? `/authors/${following.username}` : "/authors",
  });

  return { following: true };
}

export async function getAuthorFollowStats(
  authorId: string,
  viewerId?: string,
) {
  const [followerCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: authorId } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: authorId,
            },
          },
        })
      : null,
  ]);

  return { followerCount, isFollowing: !!isFollowing };
}

export async function listArticleComments(
  articleId: string,
): Promise<CommentWithAuthor[]> {
  const comments = await prisma.comment.findMany({
    where: { articleId, isDeleted: false },
    include: { author: { select: authorSelect } },
    orderBy: { createdAt: "asc" },
  });

  const byId = new Map<string, CommentWithAuthor>();
  const roots: CommentWithAuthor[] = [];

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = byId.get(comment.id)!;
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)!.replies.push(node);
    } else if (!comment.parentId) {
      roots.push(node);
    }
  }

  return roots;
}

export async function createComment(
  articleId: string,
  authorId: string,
  content: string,
  parentId?: string,
) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true, authorId: true, title: true, slug: true },
  });

  if (!article) throw new Error("Article not found");

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, articleId, isDeleted: false },
    });
    if (!parent) throw new Error("Parent comment not found");
  }

  const comment = await prisma.comment.create({
    data: { articleId, authorId, content, parentId: parentId ?? null },
    include: { author: { select: authorSelect } },
  });

  if (article.authorId !== authorId) {
    await createNotification({
      userId: article.authorId,
      type: "COMMENT",
      title: "New comment on your article",
      message: `New comment on "${article.title}"`,
      link: `/articles/${article.slug}#comments`,
    });
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== authorId) {
      await createNotification({
        userId: parent.authorId,
        type: "COMMENT",
        title: "Reply to your comment",
        message: `Someone replied to your comment on "${article.title}"`,
        link: `/articles/${article.slug}#comments`,
      });
    }
  }

  return comment;
}

export async function deleteComment(
  commentId: string,
  userId: string,
  role: string,
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { article: { select: { authorId: true } } },
  });

  if (!comment || comment.isDeleted) throw new Error("Comment not found");

  const canDelete =
    comment.authorId === userId ||
    comment.article.authorId === userId ||
    role === "EDITOR" ||
    role === "ADMIN";

  if (!canDelete) throw new Error("Unauthorized");

  await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true, content: "[deleted]" },
  });
}

export async function listUserBookmarks(userId: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                image: true,
                bio: true,
              },
            },
            category: true,
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  return {
    articles: bookmarks
      .filter((b) => b.article.status === "PUBLISHED")
      .map((b) => b.article),
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  await prisma.notification.create({ data: input });
}

export async function listNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createArticleView(
  articleId: string,
  userId?: string,
  referrer?: string,
) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, status: true },
  });

  if (!article || article.status !== "PUBLISHED") {
    throw new Error("Article not found");
  }

  const view = await prisma.$transaction(async (tx) => {
    const created = await tx.articleView.create({
      data: { articleId, userId, referrer },
    });
    await tx.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });
    return created;
  });

  return view.id;
}

export async function updateArticleViewReadTime(
  viewId: string,
  readTime: number,
) {
  await prisma.articleView.update({
    where: { id: viewId },
    data: { readTime },
  });
}

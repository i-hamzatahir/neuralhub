import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
  getAuthorByUsername,
  listPublishedArticles,
} from "@/lib/services/articles/article.service";
import { getAuthorFollowStats } from "@/lib/services/engagement/engagement.service";
import { ArticleCard } from "@/components/articles/article-card";
import { FollowAuthorButton } from "@/components/engagement/follow-author-button";
import { getRoleLabel } from "@/lib/auth/policies";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
} from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) return { title: "Author not found" };
  const displayName = author.name ?? author.username;
  return buildPageMetadata({
    title: `${displayName} (@${author.username})`,
    description:
      author.bio ??
      `Read articles by ${displayName} on NeuralHub.`,
    path: `/authors/${username}`,
    image: author.image ?? author.avatar,
    type: "profile",
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) notFound();

  const session = await auth();

  const [{ articles }, followStats] = await Promise.all([
    listPublishedArticles({ authorId: author.id, limit: 12 }),
    getAuthorFollowStats(author.id, session?.user?.id),
  ]);

  const avatar = author.image ?? author.avatar;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          buildPersonJsonLd(author),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: author.name ?? author.username, path: `/authors/${username}` },
          ]),
        ]}
      />
      <header className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
            {(author.name ?? author.username).charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-display text-3xl font-semibold">
            {author.name ?? author.username}
          </h1>
          <p className="mt-1 text-muted-foreground">@{author.username}</p>
          <span className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {getRoleLabel(author.role)}
          </span>
          {author.bio && (
            <p className="text-body mt-4 max-w-lg">{author.bio}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <p className="text-sm text-muted-foreground">
              {author._count.articles} published article
              {author._count.articles !== 1 ? "s" : ""}
              <span className="mx-2">·</span>
              {followStats.followerCount} follower
              {followStats.followerCount !== 1 ? "s" : ""}
            </p>
            <FollowAuthorButton
              followingId={author.id}
              username={author.username}
              initialFollowing={followStats.isFollowing}
              isLoggedIn={!!session?.user}
              isSelf={session?.user?.id === author.id}
            />
          </div>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-display mb-6 text-xl font-semibold">Articles</h2>
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No published articles yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

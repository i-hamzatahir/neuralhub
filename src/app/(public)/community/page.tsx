import Link from "next/link";
import Image from "next/image";
import type { Role } from "@/generated/prisma/client";
import {
  StaticPage,
  buildStaticPageMetadata,
} from "@/components/pages/static-page";
import { Button } from "@/components/ui/button";
import { getRoleLabel } from "@/lib/auth/policies";
import {
  listFeaturedAuthors,
  type AuthorProfile,
} from "@/lib/services/articles/article.service";

export const metadata = buildStaticPageMetadata(
  "Community",
  "Connect with authors, join discussions, and collaborate on AI and engineering topics.",
  "/community",
);

function FeaturedAuthorCard({ author }: { author: AuthorProfile }) {
  const avatar = author.image ?? author.avatar;
  const displayName = author.name ?? author.username;

  return (
    <Link
      href={`/authors/${author.username}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
    >
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 rounded-full object-cover border border-border"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {displayName.charAt(0)}
        </div>
      )}
      <div>
        <p className="font-semibold">{displayName}</p>
        <p className="text-sm text-muted-foreground">
          {author._count.articles} article
          {author._count.articles !== 1 ? "s" : ""} ·{" "}
          {getRoleLabel(author.role as Role)}
        </p>
      </div>
    </Link>
  );
}

export default async function CommunityPage() {
  const featuredAuthors = await listFeaturedAuthors(6);

  return (
    <StaticPage
      title="Community"
      description="Connect with authors, join discussions, and collaborate on research and engineering topics."
      path="/community"
    >
      <p>
        NeuralHub is built for people who publish and learn at the frontier of
        technology. Follow authors, comment on articles, and share your own
        perspective with the community.
      </p>

      <h2>Featured authors</h2>
      {featuredAuthors.length > 0 ? (
        <div className="not-prose grid gap-4 sm:grid-cols-2">
          {featuredAuthors.map((author) => (
            <FeaturedAuthorCard key={author.id} author={author} />
          ))}
        </div>
      ) : (
        <p>No published authors yet — be the first to join.</p>
      )}
      <p>
        <Link href="/authors" className="text-primary hover:underline">
          View all authors
        </Link>
      </p>

      <h2>Join the conversation</h2>
      <p>
        Read and discuss the latest work in{" "}
        <Link href="/articles" className="text-primary hover:underline">
          articles
        </Link>
        . Sign in to leave comments, follow writers, and bookmark posts you want
        to revisit.
      </p>

      <div className="not-prose mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/register">Join the community</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/articles">Browse articles</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/write">Become an author</Link>
        </Button>
      </div>
    </StaticPage>
  );
}

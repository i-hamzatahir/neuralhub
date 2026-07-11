import Link from "next/link";
import Image from "next/image";
import type { Role } from "@/generated/prisma/client";
import { getRoleLabel } from "@/lib/auth/policies";
import {
  listAuthorsWithPublishedArticles,
  type AuthorProfile,
} from "@/lib/services/articles/article.service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

export const metadata = buildPageMetadata({
  title: "Authors",
  description:
    "Discover writers and researchers publishing on AI, data science, and technology.",
  path: "/authors",
});

function AuthorCard({ author }: { author: AuthorProfile }) {
  const avatar = author.image ?? author.avatar;
  const displayName = author.name ?? author.username;

  return (
    <Link
      href={`/authors/${author.username}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {displayName.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-display font-semibold group-hover:text-primary transition-colors">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground">@{author.username}</p>
        </div>
      </div>
      {author.bio && (
        <p className="text-body mt-4 line-clamp-3 text-sm text-muted-foreground">
          {author.bio}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {author._count.articles} article
          {author._count.articles !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>{getRoleLabel(author.role as Role)}</span>
      </div>
    </Link>
  );
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AuthorsPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { authors, total, pages } = await listAuthorsWithPublishedArticles({
    page,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "Authors",
          description:
            "Discover writers and researchers publishing on NeuralHub.",
          path: "/authors",
        })}
      />
      <header className="mb-10">
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">Authors</h1>
        <p className="text-body mt-2">
          {total} author{total !== 1 ? "s" : ""} publishing on NeuralHub
        </p>
      </header>

      {authors.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No published authors yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/authors?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

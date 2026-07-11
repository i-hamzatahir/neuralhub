"use client";

import { ArrowRight, Sparkles, FlaskConical, Wrench } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/articles/article-card";
import { NewsletterSubscribeForm } from "@/components/newsletter/newsletter-subscribe-form";
import { FadeIn } from "@/components/motion/fade-in";
import { researchHighlights, developerTools } from "@/config/curated";
import type { Role } from "@/generated/prisma/client";
import { getRoleLabel } from "@/lib/auth/policies";
import type { ArticleWithRelations, AuthorProfile } from "@/lib/services/articles/article.service";
import type { Category } from "@/generated/prisma/client";

interface HomeContentProps {
  featuredArticle: ArticleWithRelations | null;
  latestArticles: ArticleWithRelations[];
  trendingArticles: ArticleWithRelations[];
  categories: Category[];
  featuredAuthors: AuthorProfile[];
}

export function HomeContent({
  featuredArticle,
  latestArticles,
  trendingArticles,
  categories,
  featuredAuthors,
}: HomeContentProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[300px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Premium knowledge platform
            </div>
            <h1 className="animate-fade-up stagger-1 text-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Explore{" "}
              <span className="gradient-brand">Artificial Intelligence</span>
              , Data Science, and the Future of Technology
            </h1>
            <p className="animate-fade-up stagger-2 text-body mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
              {siteConfig.description}
            </p>
            <div className="animate-fade-up stagger-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="xl" asChild>
                <Link href="/articles">
                  Explore Articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/write">Start Writing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredArticle && (
        <section className="border-t border-border/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-label mb-6">Featured</p>
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

      {/* Latest articles */}
      {latestArticles.length > 0 && (
        <section className="border-t border-border/60 bg-muted/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-label mb-3">Latest</p>
                <h2 className="text-display text-2xl font-semibold sm:text-3xl">
                  Recent articles
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/articles">View all</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trendingArticles.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-label mb-3">Trending</p>
            <h2 className="text-display mb-8 text-2xl font-semibold sm:text-3xl">
              Popular reads
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {trendingArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <span className="text-2xl font-bold text-muted-foreground/40">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-label text-primary">{article.category.name}</p>
                    <h3 className="text-display mt-1 font-semibold group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.viewCount} views · {article.readingTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-t border-border/60 bg-muted/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-label mb-3">Topics</p>
            <h2 className="text-display mb-8 text-2xl font-semibold sm:text-3xl">
              Explore by category
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <h3 className="text-display font-semibold">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured authors */}
      {featuredAuthors.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-label mb-3">Authors</p>
                <h2 className="text-display text-2xl font-semibold sm:text-3xl">
                  Featured writers
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/authors">View all</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAuthors.map((author) => {
                const avatar = author.image ?? author.avatar;
                const name = author.name ?? author.username;
                return (
                  <Link
                    key={author.id}
                    href={`/authors/${author.username}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                  >
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {author._count.articles} article
                        {author._count.articles !== 1 ? "s" : ""} ·{" "}
                        {getRoleLabel(author.role as Role)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Research highlights */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h2 className="text-display text-2xl font-semibold sm:text-3xl">
                Research highlights
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-3">
            {researchHighlights.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <Link
                  href={item.href}
                  className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <Badge variant="outline" className="mb-3">
                    {item.tag}
                  </Badge>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Developer tools */}
      <section className="border-t border-border/60 bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="text-display text-2xl font-semibold sm:text-3xl">
                Developer tools
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {developerTools.map((tool, i) => (
              <FadeIn key={tool.name} delay={i * 0.08}>
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <Badge className="mb-2">{tool.category}</Badge>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-glow">
              <h2 className="text-display text-2xl font-semibold">
                Stay in the loop
              </h2>
              <p className="mt-3 text-muted-foreground">
                Curated articles on AI, data science, and engineering — no spam.
              </p>
              <div className="mt-6">
                <NewsletterSubscribeForm source="newsletter-page" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-16 text-center shadow-glow sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5"
              aria-hidden="true"
            />
            <h2 className="text-display relative text-2xl font-semibold sm:text-3xl">
              Ready to publish your ideas?
            </h2>
            <p className="text-body relative mx-auto mt-4 max-w-lg">
              Join a community of researchers, engineers, and writers shaping
              the conversation around technology.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/write">Start Writing</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/about">About NeuralHub</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

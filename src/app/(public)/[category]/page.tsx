import {
  getCategories,
  getCategoryBySlug,
  listPublishedArticles,
} from "@/lib/services/articles/article.service";
import { notFound } from "next/navigation";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/json-ld-script";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return buildPageMetadata({
    title: `${category.name} Articles`,
    description:
      category.description ??
      `Read ${category.name} articles, tutorials, and guides on AI, technology, and software engineering at NeuralHub.`,
    path: `/${slug}`,
    keywords: [category.name, "articles", "tutorials", "guides"],
  });
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({ category: category.slug }));
  } catch {
    // Tables may not exist yet on first deploy — run db:migrate before build
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const { page: pageStr } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const { articles, total } = await listPublishedArticles({
    page,
    categorySlug: slug,
  });

  return (
    <div className="blog-container py-10 sm:py-12">
      <JsonLdScript
        data={[
          buildCollectionPageJsonLd({
            name: `${category.name} Articles`,
            description: category.description,
            path: `/${slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: category.name, path: `/${slug}` },
          ]),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Articles", href: "/articles" },
          { name: category.name },
        ]}
        className="mb-6"
      />

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name} Articles
        </h1>
        {category.description && (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {total} article{total !== 1 ? "s" : ""}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No articles in this category yet.
        </p>
      ) : (
        <div className="mt-8">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

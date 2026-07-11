import {
  getCategories,
  getCategoryBySlug,
  listPublishedArticles,
} from "@/lib/services/articles/article.service";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/articles/article-card";
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
      `Articles about ${category.name} on NeuralHub.`,
    path: `/${slug}`,
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          buildCollectionPageJsonLd({
            name: `${category.name} Articles`,
            description: category.description,
            path: `/${slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: category.name, path: `/${slug}` },
          ]),
        ]}
      />
      <header className="mb-10">
        <p className="text-label text-primary">{category.name}</p>
        <h1 className="text-display mt-2 text-3xl font-semibold sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-body mt-3 max-w-2xl">{category.description}</p>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

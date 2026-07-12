import { notFound } from "next/navigation";
import {
  getArticleById,
  getCategories,
} from "@/lib/services/articles/article.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ArticleForm } from "@/components/dashboard/article-form";
import { isAiEnabled } from "@/lib/services/ai/ai.service";
import { getAppUrl } from "@/lib/url";

export const metadata = { title: "Edit article" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const [article, categories] = await Promise.all([
    getArticleById(id, user.id),
    getCategories(),
  ]);

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <ArticleForm
        categories={categories}
        article={article}
        aiEnabled={isAiEnabled()}
        appUrl={getAppUrl()}
      />
    </div>
  );
}

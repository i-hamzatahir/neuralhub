import { getCategories } from "@/lib/services/articles/article.service";
import { ArticleForm } from "@/components/dashboard/article-form";
import { isAiEnabled } from "@/lib/services/ai/ai.service";
import { getAppUrl } from "@/lib/url";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <ArticleForm
        categories={categories}
        aiEnabled={isAiEnabled()}
        appUrl={getAppUrl()}
      />
    </div>
  );
}

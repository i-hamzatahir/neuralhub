"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArticleEditor } from "@/components/editor/article-editor";
import { ArticleContent } from "@/components/articles/article-content";
import { Button } from "@/components/ui/button";
import { Input, InputGroup, Textarea } from "@/components/ui/input";
import {
  autosaveArticleAction,
  saveArticleAction,
  type ArticleActionResult,
} from "@/lib/actions/articles";
import {
  aiSuggestExcerptAction,
  aiSuggestTitleAction,
} from "@/lib/actions/ai";
import type { Category } from "@/generated/prisma/client";
import { cn } from "@/lib/utils/cn";

function formatDatetimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface ArticleFormProps {
  categories: Category[];
  aiEnabled?: boolean;
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    categoryId: string;
    status: string;
    scheduledAt: Date | null;
    affiliateUrl: string | null;
    isSponsored: boolean;
    isAffiliate: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    ogImage: string | null;
    tags: { tag: { name: string } }[];
  };
}

export function ArticleForm({ categories, aiEnabled = false, article }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: article?.id ?? "",
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    coverImage: article?.coverImage ?? "",
    categoryId: article?.categoryId ?? categories[0]?.id ?? "",
    tags: article?.tags.map((t) => t.tag.name).join(", ") ?? "",
    seoTitle: article?.seoTitle ?? "",
    seoDescription: article?.seoDescription ?? "",
    canonicalUrl: article?.canonicalUrl ?? "",
    ogImage: article?.ogImage ?? "",
    scheduledAt: formatDatetimeLocal(article?.scheduledAt),
    affiliateUrl: article?.affiliateUrl ?? "",
    isSponsored: article?.isSponsored ?? false,
    isAffiliate: article?.isAffiliate ?? false,
    status: article?.status ?? "DRAFT",
  });

  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const uploadImage = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Upload failed");
    }
    const { url } = await res.json();
    return url as string;
  }, []);

  const triggerAutosave = useCallback(
    (data: typeof form) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        if (!data.title && !data.content) return;
        setAutosaveStatus("saving");
        startTransition(async () => {
          const result = await autosaveArticleAction({
            id: data.id || undefined,
            title: data.title || "Untitled",
            content: data.content || JSON.stringify({ type: "doc", content: [] }),
            categoryId: data.categoryId,
            excerpt: data.excerpt,
            coverImage: data.coverImage,
            tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
          });
          if (result.success && result.articleId && !data.id) {
            setForm((f) => ({ ...f, id: result.articleId! }));
            router.replace(`/dashboard/articles/${result.articleId}/edit`);
          }
          setAutosaveStatus(result.success ? "saved" : "idle");
        });
      }, 2000);
    },
    [router],
  );

  useEffect(() => {
    if (form.content || form.title) triggerAutosave(form);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form.content, form.title, form.excerpt, form.categoryId, triggerAutosave, form]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleAiSuggestTitle() {
    startAiTransition(async () => {
      const result = await aiSuggestTitleAction(form.content);
      if (result.success && result.result) {
        update("title", result.result);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleAiSuggestExcerpt() {
    startAiTransition(async () => {
      const result = await aiSuggestExcerptAction(form.title, form.content);
      if (result.success && result.result) {
        update("excerpt", result.result);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleSubmit(status: string) {
    setError(null);
    const fd = new FormData();
    Object.entries({ ...form, status }).forEach(([k, v]) => {
      if (k === "isSponsored" || k === "isAffiliate") return;
      fd.append(k, String(v));
    });
    if (form.isSponsored) fd.append("isSponsored", "on");
    if (form.isAffiliate) fd.append("isAffiliate", "on");
    startTransition(async () => {
      const result: ArticleActionResult = await saveArticleAction(
        { success: false },
        fd,
      );
      if (result.success) {
        router.push("/dashboard/articles");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-display text-2xl font-semibold">
            {article ? "Edit article" : "New article"}
          </h1>
          <span
            className={cn(
              "text-xs text-muted-foreground",
              autosaveStatus === "saving" && "text-warning",
              autosaveStatus === "saved" && "text-success",
            )}
          >
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Draft saved"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            loading={isPending}
          >
            Save draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit("REVIEW")}
            loading={isPending}
          >
            Submit for review
          </Button>
          <Button onClick={() => handleSubmit("PUBLISHED")} loading={isPending}>
            Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <InputGroup label="Title" htmlFor="title">
            <div className="flex gap-2">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Article title"
                className="flex-1"
              />
              {aiEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={aiPending}
                  onClick={handleAiSuggestTitle}
                >
                  AI title
                </Button>
              )}
            </div>
          </InputGroup>

          {!showPreview ? (
          <ArticleEditor
            content={form.content}
            onChange={(c) => update("content", c)}
            onImageUpload={uploadImage}
          />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <ArticleContent content={form.content || '{"type":"doc","content":[]}'} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <InputGroup label="Category" htmlFor="categoryId">
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-ring"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup label="Tags" htmlFor="tags" description="Comma-separated">
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="ai, machine-learning"
            />
          </InputGroup>

          <InputGroup label="Excerpt" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Short summary (auto-generated if empty)"
              rows={3}
            />
            {aiEnabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                loading={aiPending}
                onClick={handleAiSuggestExcerpt}
              >
                AI excerpt
              </Button>
            )}
          </InputGroup>

          <InputGroup label="Cover image URL" htmlFor="coverImage">
            <div className="flex gap-2">
              <Input
                id="coverImage"
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://…"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) {
                      const url = await uploadImage(file);
                      update("coverImage", url);
                    }
                  };
                  input.click();
                }}
              >
                Upload
              </Button>
            </div>
          </InputGroup>

          {form.coverImage && (
            <div className="relative h-32 w-full">
              <Image
                src={form.coverImage}
                alt="Cover preview"
                fill
                unoptimized
                className="rounded-lg border border-border object-cover"
              />
            </div>
          )}

          <InputGroup
            label="Schedule publish"
            htmlFor="scheduledAt"
            description="Optional — article auto-publishes at this time"
          >
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => update("scheduledAt", e.target.value)}
            />
          </InputGroup>

          <InputGroup label="Affiliate URL" htmlFor="affiliateUrl">
            <Input
              id="affiliateUrl"
              value={form.affiliateUrl}
              onChange={(e) => update("affiliateUrl", e.target.value)}
              placeholder="https://…"
            />
          </InputGroup>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isSponsored}
              onChange={(e) => setForm((f) => ({ ...f, isSponsored: e.target.checked }))}
            />
            Sponsored content
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAffiliate}
              onChange={(e) => setForm((f) => ({ ...f, isAffiliate: e.target.checked }))}
            />
            Contains affiliate links
          </label>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowSeo(!showSeo)}
          >
            {showSeo ? "Hide" : "Show"} SEO settings
          </Button>

          {showSeo && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <InputGroup label="SEO title" htmlFor="seoTitle">
                <Input
                  id="seoTitle"
                  value={form.seoTitle}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  placeholder="Custom title for search engines"
                />
              </InputGroup>
              <InputGroup label="SEO description" htmlFor="seoDescription">
                <Textarea
                  id="seoDescription"
                  value={form.seoDescription}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  rows={2}
                />
              </InputGroup>
              <InputGroup label="Canonical URL" htmlFor="canonicalUrl">
                <Input
                  id="canonicalUrl"
                  value={form.canonicalUrl}
                  onChange={(e) => update("canonicalUrl", e.target.value)}
                />
              </InputGroup>
              <InputGroup label="OG image URL" htmlFor="ogImage">
                <Input
                  id="ogImage"
                  value={form.ogImage}
                  onChange={(e) => update("ogImage", e.target.value)}
                />
              </InputGroup>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

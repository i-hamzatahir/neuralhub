"use client";

import { useMemo, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { aiEnhanceSeoAction } from "@/lib/actions/seo";
import {
  analyzeArticleSeo,
  getChecksNeedingFix,
  type SeoAnalysisInput,
  type SeoAnalysisResult,
} from "@/lib/seo/analyzer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface SeoAssistantProps {
  form: SeoAnalysisInput;
  aiEnabled?: boolean;
  onApply: (updates: Partial<SeoAnalysisInput>) => void;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function scoreRingColor(score: number): string {
  if (score >= 85) return "stroke-success";
  if (score >= 70) return "stroke-primary";
  if (score >= 50) return "stroke-warning";
  return "stroke-destructive";
}

function SeverityIcon({ severity }: { severity: SeoAnalysisResult["checks"][number]["severity"] }) {
  if (severity === "good") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />;
  }
  return <AlertCircle className="h-4 w-4 shrink-0 text-warning" />;
}

export function SeoAssistant({ form, aiEnabled = false, onApply }: SeoAssistantProps) {
  const [aiPending, startAiTransition] = useTransition();

  const hasContent = useMemo(
    () => Boolean(form.title.trim() || form.content.trim()),
    [form.title, form.content],
  );

  const analysis = useMemo(() => {
    if (!hasContent) return null;
    return analyzeArticleSeo(form);
  }, [form, hasContent]);

  function applyRecommendedFixes() {
    if (!analysis) return;
    const { suggestions } = analysis;
    onApply({
      slug: form.slug.trim() ? form.slug : suggestions.slug ?? form.slug,
      excerpt: form.excerpt.trim() ? form.excerpt : suggestions.excerpt ?? form.excerpt,
      seoTitle: form.seoTitle.trim() ? form.seoTitle : suggestions.seoTitle ?? form.seoTitle,
      seoDescription: form.seoDescription.trim()
        ? form.seoDescription
        : suggestions.seoDescription ?? form.seoDescription,
      tags: form.tags.trim() ? form.tags : suggestions.tags ?? form.tags,
    });
  }

  function handleAiEnhance() {
    startAiTransition(async () => {
      const result = await aiEnhanceSeoAction({
        title: form.title,
        content: form.content,
        categoryId: form.categoryId,
      });

      if (!result.success || !result.suggestions) return;

      onApply({
        seoTitle: result.suggestions.seoTitle ?? form.seoTitle,
        seoDescription: result.suggestions.seoDescription ?? form.seoDescription,
        excerpt: result.suggestions.excerpt ?? form.excerpt,
        tags: result.suggestions.tags ?? form.tags,
        slug: form.slug.trim() ? form.slug : result.suggestions.slug ?? form.slug,
      });
    });
  }

  const fixes = analysis ? getChecksNeedingFix(analysis) : [];
  const ringProgress = analysis ? Math.max(8, (analysis.score / 100) * 88) : 0;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">SEO Assistant</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Live score and fixes to improve Google visibility.
          </p>
        </div>

        {analysis && (
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className={scoreRingColor(analysis.score)}
                strokeWidth="3"
                strokeDasharray={`${ringProgress} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className={cn("absolute text-sm font-bold", scoreColor(analysis.score))}>
              {analysis.score}
            </span>
          </div>
        )}
      </div>

      {!hasContent ? (
        <p className="text-sm text-muted-foreground">
          Add a title and content to start SEO analysis.
        </p>
      ) : analysis ? (
        <>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Google preview
            </p>
            <p className="mt-2 text-sm text-primary">
              {analysis.metaPreview.title}
            </p>
            <p className="text-xs text-success">
              neuralhub.blog/articles/{analysis.metaPreview.urlSlug}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {analysis.metaPreview.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              Grade: {analysis.grade}
            </span>
            <span className="text-muted-foreground">
              {fixes.length} improvement{fixes.length === 1 ? "" : "s"} available
            </span>
          </div>

          <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {analysis.checks.map((check) => (
              <li
                key={check.id}
                className="rounded-md border border-border/70 bg-background px-3 py-2"
              >
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={check.severity} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {check.label}{" "}
                      <span className="text-muted-foreground">
                        ({check.score}/{check.maxScore})
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {check.message}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={applyRecommendedFixes}
            >
              <Wand2 className="h-4 w-4" />
              Apply recommended fixes
            </Button>

            {aiEnabled && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                loading={aiPending}
                onClick={handleAiEnhance}
              >
                <Sparkles className="h-4 w-4" />
                Enhance with AI
              </Button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

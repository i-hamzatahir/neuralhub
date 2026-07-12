"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, ClipboardCheck } from "lucide-react";
import {
  analyzePublishReadiness,
  type PublishReadinessInput,
} from "@/lib/publish/checklist";
import { cn } from "@/lib/utils/cn";

interface PublishChecklistProps {
  form: PublishReadinessInput;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function PublishChecklist({ form }: PublishChecklistProps) {
  const hasContent = useMemo(
    () => Boolean(form.title.trim() || form.content.trim()),
    [form.title, form.content],
  );

  const result = useMemo(() => {
    if (!hasContent) return null;
    return analyzePublishReadiness(form);
  }, [form, hasContent]);

  if (!result) return null;

  const requiredRemaining = result.checks.filter(
    (check) => check.severity === "required" && !check.passed,
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Publish checklist</h3>
            <p className="text-xs text-muted-foreground">
              {result.ready
                ? "Required checks passed — ready to publish."
                : `${requiredRemaining} required item${requiredRemaining === 1 ? "" : "s"} remaining.`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold tabular-nums", scoreColor(result.score))}>
            {result.score}
          </p>
          <p className="text-xs text-muted-foreground">readiness</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {result.checks.map((check) => (
          <li
            key={check.id}
            className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
          >
            {check.passed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : (
              <AlertCircle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  check.severity === "required" ? "text-destructive" : "text-warning",
                )}
              />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {check.label}
                {check.severity === "recommended" && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    (recommended)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{check.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

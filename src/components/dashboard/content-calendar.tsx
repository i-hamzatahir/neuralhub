"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarArticle } from "@/lib/services/articles/article.service";
import type { ArticleStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusStyles: Record<ArticleStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-warning/20 text-warning",
  PUBLISHED: "bg-success/20 text-success",
  ARCHIVED: "bg-destructive/20 text-destructive",
};

interface ContentCalendarProps {
  articles: CalendarArticle[];
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getArticleDate(article: CalendarArticle): Date | null {
  if (article.scheduledAt) return new Date(article.scheduledAt);
  if (article.publishedAt) return new Date(article.publishedAt);
  return null;
}

export function ContentCalendar({ articles }: ContentCalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const articlesByDay = useMemo(() => {
    const map = new Map<string, CalendarArticle[]>();
    for (const article of articles) {
      const date = getArticleDate(article);
      if (!date) continue;
      const key = dateKey(date);
      const existing = map.get(key) ?? [];
      existing.push(article);
      map.set(key, existing);
    }
    return map;
  }, [articles]);

  const monthLabel = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  }

  const upcoming = articles
    .filter((article) => article.scheduledAt && new Date(article.scheduledAt) > today)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    )
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{monthLabel}</h2>
          <div className="flex gap-1">
            <Button type="button" variant="outline" size="icon-sm" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMonth(today.getMonth());
                setYear(today.getFullYear());
              }}
            >
              Today
            </Button>
            <Button type="button" variant="outline" size="icon-sm" onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-24 rounded-lg bg-muted/10" />;
            }

            const cellDate = new Date(year, month, day);
            const key = dateKey(cellDate);
            const dayArticles = articlesByDay.get(key) ?? [];
            const isToday =
              cellDate.getDate() === today.getDate() &&
              cellDate.getMonth() === today.getMonth() &&
              cellDate.getFullYear() === today.getFullYear();

            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 rounded-lg border border-border p-1.5",
                  isToday && "border-primary/40 bg-primary/5",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {day}
                </p>
                <ul className="mt-1 space-y-1">
                  {dayArticles.slice(0, 3).map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/dashboard/articles/${article.id}/edit`}
                        className={cn(
                          "block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight hover:opacity-80",
                          statusStyles[article.status],
                        )}
                        title={article.title}
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                  {dayArticles.length > 3 && (
                    <li className="px-1 text-[10px] text-muted-foreground">
                      +{dayArticles.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            Review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            Draft / scheduled
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Upcoming scheduled</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No scheduled posts. Set a publish date on any draft in the article editor.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcoming.map((article) => (
              <li
                key={article.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <Link
                  href={`/dashboard/articles/${article.id}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {article.title}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(article.scheduledAt!).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

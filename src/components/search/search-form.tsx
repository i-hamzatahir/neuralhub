"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface SearchFilterOption {
  categories: { id: string; name: string; slug: string }[];
  tags: {
    id: string;
    name: string;
    slug: string;
    _count: { articles: number };
  }[];
  authors: { username: string; name: string | null }[];
}

interface SearchFormProps {
  options: SearchFilterOption;
  initialQuery: string;
  initialCategory: string;
  initialTag: string;
  initialAuthor: string;
}

export function SearchForm({
  options,
  initialQuery,
  initialCategory,
  initialTag,
  initialAuthor,
}: SearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);
  const [author, setAuthor] = useState(initialAuthor);

  const isFirstRender = useRef(true);

  const pushFilters = useCallback(
    (next: {
      query?: string;
      category?: string;
      tag?: string;
      author?: string;
    }) => {
      const params = new URLSearchParams();
      const q = next.query ?? query;
      const cat = next.category ?? category;
      const t = next.tag ?? tag;
      const a = next.author ?? author;

      if (q.trim()) params.set("q", q.trim());
      if (cat) params.set("category", cat);
      if (t) params.set("tag", t);
      if (a) params.set("author", a);

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [author, category, pathname, query, router, tag],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      pushFilters({ query });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, pushFilters]);

  function handleFilterChange(
    key: "category" | "tag" | "author",
    value: string,
  ) {
    if (key === "category") setCategory(value);
    if (key === "tag") setTag(value);
    if (key === "author") setAuthor(value);
    pushFilters({ [key]: value });
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setTag("");
    setAuthor("");
    startTransition(() => router.push(pathname));
  }

  const hasFilters = query || category || tag || author;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, authors..."
          className="pl-10"
          aria-label="Search articles"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Searching...
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-label">Category</span>
          <select
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <option value="">All categories</option>
            {options.categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-label">Tag</span>
          <select
            value={tag}
            onChange={(e) => handleFilterChange("tag", e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <option value="">All tags</option>
            {options.tags
              .filter((t) => t._count.articles > 0)
              .map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name} ({t._count.articles})
                </option>
              ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-label">Author</span>
          <select
            value={author}
            onChange={(e) => handleFilterChange("author", e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <option value="">All authors</option>
            {options.authors.map((a) => (
              <option key={a.username} value={a.username}>
                {a.name ?? a.username}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

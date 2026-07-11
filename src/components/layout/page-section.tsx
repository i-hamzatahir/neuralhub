import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "bordered";
  id?: string;
}

export function PageSection({
  children,
  className,
  variant = "default",
  id,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20",
        variant === "muted" && "border-t border-border/60 bg-muted/40",
        variant === "bordered" && "border-t border-border/60",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {label && <p className="text-label mb-2">{label}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function PageContainer({
  children,
  className,
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-3xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

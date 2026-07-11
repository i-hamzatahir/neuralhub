import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { brand } from "@/config/nav";

interface BrandLogoProps {
  className?: string;
  showName?: boolean;
}

export function BrandLogo({ className, showName = true }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        NH
      </span>
      {showName && (
        <span className="text-base font-bold tracking-tight text-foreground">
          {brand.name}
        </span>
      )}
    </Link>
  );
}

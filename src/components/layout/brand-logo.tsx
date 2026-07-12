import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { brand } from "@/config/nav";
import { siteConfig } from "@/config/site";

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
      <Image
        src={siteConfig.logo}
        alt={`${brand.name} logo`}
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        priority
      />
      {showName && (
        <span className="text-base font-bold tracking-tight text-foreground">
          {brand.name}
        </span>
      )}
    </Link>
  );
}

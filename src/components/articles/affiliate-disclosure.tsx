interface AffiliateDisclosureProps {
  isSponsored?: boolean;
  isAffiliate?: boolean;
}

export function AffiliateDisclosure({
  isSponsored,
  isAffiliate,
}: AffiliateDisclosureProps) {
  if (!isSponsored && !isAffiliate) return null;

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
      {isSponsored && isAffiliate
        ? "This article contains sponsored content and affiliate links. We may earn a commission from purchases."
        : isSponsored
          ? "This article contains sponsored content."
          : "This article contains affiliate links. We may earn a commission from purchases."}
    </div>
  );
}

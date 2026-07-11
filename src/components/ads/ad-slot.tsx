"use client";

import { useEffect, useRef } from "react";
import { adConfig, isAdSlotConfigured, type AdSlotName } from "@/config/ads";
import { cn } from "@/lib/utils/cn";

interface AdSlotProps {
  slot: AdSlotName;
  className?: string;
}

export function AdSlot({ slot, className }: AdSlotProps) {
  const pushed = useRef(false);
  const slotConfig = adConfig.slots[slot];

  useEffect(() => {
    if (!isAdSlotConfigured(slot) || pushed.current) return;
    pushed.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers or script not loaded
    }
  }, [slot]);

  if (!isAdSlotConfigured(slot)) return null;

  return (
    <div className={cn("overflow-hidden", className)}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={adConfig.publisherId}
        data-ad-slot={slotConfig.id}
        data-ad-format={slotConfig.format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

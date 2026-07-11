export const adConfig = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_ID ?? "",
  slots: {
    header: {
      id: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER ?? "",
      format: "horizontal" as const,
    },
    sidebar: {
      id: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
      format: "rectangle" as const,
    },
    inArticle: {
      id: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "",
      format: "fluid" as const,
    },
    footer: {
      id: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
      format: "horizontal" as const,
    },
  },
} as const;

export type AdSlotName = keyof typeof adConfig.slots;

export function isAdSlotConfigured(slot: AdSlotName) {
  return (
    adConfig.enabled &&
    adConfig.publisherId.length > 0 &&
    adConfig.slots[slot].id.length > 0
  );
}

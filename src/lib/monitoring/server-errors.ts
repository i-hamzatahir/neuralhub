import { trackEvent } from "@/lib/services/analytics/analytics.service";

export async function reportServerError(details: {
  message: string;
  digest?: string;
  path?: string;
  method?: string;
  source?: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[server-error]", details);
    return;
  }

  console.error("[server-error]", details);

  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  try {
    await trackEvent("server.error", {
      properties: {
        message: details.message.slice(0, 500),
        digest: details.digest ?? null,
        path: details.path ?? null,
        method: details.method ?? null,
        source: details.source ?? "instrumentation",
      },
    });
  } catch {
    // Already logged to console above
  }
}

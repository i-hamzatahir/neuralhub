import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { trackEvent } from "@/lib/services/analytics/analytics.service";
import { z } from "zod";

const clientErrorSchema = z.object({
  message: z.string().max(500),
  digest: z.string().max(100).optional(),
  path: z.string().max(300).optional(),
  source: z.enum(["window", "unhandledrejection", "global-error"]).optional(),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIpFromHeaders(request.headers);
  const rateLimit = await rateLimitByIp(ip, "client-error", 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = clientErrorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await trackEvent("client.error", {
      properties: {
        message: parsed.data.message,
        digest: parsed.data.digest ?? null,
        path: parsed.data.path ?? null,
        source: parsed.data.source ?? "unknown",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { publishScheduledArticles } from "@/lib/services/admin/admin.service";
import { purgeExpiredRateLimits } from "@/lib/services/analytics/analytics.service";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [published, rateLimitsPurged] = await Promise.all([
      publishScheduledArticles(),
      purgeExpiredRateLimits(),
    ]);
    return NextResponse.json({
      success: true,
      published,
      rateLimitsPurged,
    });
  } catch {
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

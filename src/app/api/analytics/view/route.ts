import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import {
  createArticleView,
  updateArticleViewReadTime,
} from "@/lib/services/engagement/engagement.service";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { createViewToken, verifyViewToken } from "@/lib/security/view-token";
import { viewReadTimeSchema } from "@/lib/validations/engagement";

export async function POST(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);

  const rateLimit = await rateLimitByIp(ip, "article-view", 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { articleId, referrer } = await request.json();
    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "Invalid articleId" }, { status: 400 });
    }

    const session = await auth();
    const viewId = await createArticleView(
      articleId,
      session?.user?.id,
      typeof referrer === "string" ? referrer.slice(0, 500) : undefined,
    );

    return NextResponse.json({
      success: true,
      viewId,
      viewToken: createViewToken(viewId),
    });
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);
  const rateLimit = await rateLimitByIp(ip, "article-view-patch", 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = viewReadTimeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (
      !verifyViewToken(parsed.data.viewId, parsed.data.viewToken)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await updateArticleViewReadTime(
      parsed.data.viewId,
      parsed.data.readTime,
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update read time" }, { status: 500 });
  }
}

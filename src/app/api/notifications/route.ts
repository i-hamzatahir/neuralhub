import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/services/engagement/engagement.service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIpFromHeaders(request.headers);
  const rateLimit = await rateLimitByIp(ip, "notifications", 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10),
  );

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.user.id, limit),
    getUnreadNotificationCount(session.user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

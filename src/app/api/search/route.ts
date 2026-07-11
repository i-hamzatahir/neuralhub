import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { searchArticles } from "@/lib/services/search";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";

export const revalidate = 0;

const MAX_QUERY_LENGTH = 200;

export async function GET(request: Request) {
  const ip = getClientIpFromHeaders(request.headers);

  const rateLimit = await rateLimitByIp(ip, "search", 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Try again later." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? undefined;
  const query =
    rawQuery && rawQuery.length > MAX_QUERY_LENGTH
      ? rawQuery.slice(0, MAX_QUERY_LENGTH)
      : rawQuery;
  const categorySlug = searchParams.get("category") ?? undefined;
  const tagSlug = searchParams.get("tag") ?? undefined;
  const authorUsername = searchParams.get("author") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12),
  );

  const result = await searchArticles({
    query,
    categorySlug: categorySlug || undefined,
    tagSlug: tagSlug || undefined,
    authorUsername: authorUsername || undefined,
    page,
    limit,
  });

  return NextResponse.json(result);
}

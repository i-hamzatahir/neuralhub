import { prisma } from "@/lib/db/prisma";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - (now.getTime() % windowMs));
  const expiresAt = new Date(windowStart.getTime() + windowMs);

  const entry = await prisma.rateLimitEntry.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: {
      key,
      windowStart,
      count: 1,
      expiresAt,
    },
    update: {
      count: { increment: 1 },
    },
  });

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  };
}

export async function rateLimitByIp(
  ip: string,
  action: string,
  limit: number,
  windowMs: number,
) {
  return checkRateLimit({ key: `${action}:ip:${ip}`, limit, windowMs });
}

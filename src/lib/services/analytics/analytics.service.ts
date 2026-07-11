import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function trackEvent(
  event: string,
  options?: {
    userId?: string;
    sessionId?: string;
    properties?: Prisma.InputJsonValue;
  },
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        userId: options?.userId,
        sessionId: options?.sessionId,
        properties: options?.properties,
      },
    });
  } catch (error) {
    console.error("Analytics track failed:", error);
  }
}

export async function purgeExpiredRateLimits() {
  const result = await prisma.rateLimitEntry.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}

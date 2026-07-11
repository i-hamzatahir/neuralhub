"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/auth/audit";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export async function becomeAuthorAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/write");
  }

  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "become-author", 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    redirect("/write?error=rate_limit");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, emailVerified: true },
  });

  if (!user) {
    redirect("/write?error=not_found");
  }

  if (user.role !== "USER") {
    redirect("/dashboard");
  }

  if (!user.emailVerified) {
    redirect("/write?error=verify_email");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "AUTHOR" },
  });

  await createAuditLog({
    action: "USER_ROLE_CHANGE",
    userId: user.id,
    entityType: "User",
    entityId: user.id,
    metadata: { from: "USER", to: "AUTHOR", source: "self_service" },
    ipAddress: ip,
  });

  redirect("/dashboard/articles/new");
}

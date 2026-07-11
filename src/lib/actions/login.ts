"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/lib/auth";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { sanitizeCallbackUrl } from "@/lib/security/redirect";
import { loginSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/lib/actions/auth";

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "login", 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many login attempts. Try again in 15 minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user && !user.emailVerified) {
    return {
      success: false,
      error: "Please verify your email before logging in.",
    };
  }

  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl") as string,
  );

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { success: false, error: "Invalid email or password." };
      }
    }
    throw error;
  }

  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

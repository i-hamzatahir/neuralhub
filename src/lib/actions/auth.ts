"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/auth/audit";
import { hashPassword } from "@/lib/auth/password";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import {
  consumeResetToken,
  createPasswordResetToken,
  createVerificationToken,
  verifyEmailToken,
  verifyResetToken,
} from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettingsMap } from "@/lib/services/admin/admin.service";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { isSiteSettingEnabled } from "@/lib/security/site-settings";
import {
  buildPasswordResetEmail,
  buildVerificationEmail,
  sendEmail,
} from "@/lib/email/client";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function registerUser(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "register", 3, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const siteSettings = await getSiteSettingsMap();
  if (!isSiteSettingEnabled(siteSettings, "site.registration_enabled")) {
    return { success: false, error: "Registration is currently disabled." };
  }

  const raw = {
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, username, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username: username.toLowerCase() }],
    },
  });

  if (existing) {
    return {
      success: false,
      error:
        existing.email === normalizedEmail
          ? "Email already registered"
          : "Username already taken",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      username: username.toLowerCase(),
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      settings: { create: {} },
    },
  });

  const token = await createVerificationToken(normalizedEmail);
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const emailContent = buildVerificationEmail(name, verifyUrl);

  try {
    await sendEmail({
      to: normalizedEmail,
      ...emailContent,
    });
  } catch {
    await prisma.user.delete({ where: { id: user.id } });
    return {
      success: false,
      error: "Failed to send verification email. Please try again.",
    };
  }

  await createAuditLog({
    action: "SECURITY_EVENT",
    userId: user.id,
    metadata: { event: "user_registered" },
    ipAddress: ip,
  });

  redirect(`/verify-email?email=${encodeURIComponent(normalizedEmail)}&pending=true`);
}

export async function verifyEmailAction(
  token: string,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "verify-email", 10, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const result = await verifyEmailToken(token);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: "Email verified successfully. You can now log in." };
}

export async function resendVerificationEmail(
  email: string,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "resend-verify", 3, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.emailVerified) {
    return {
      success: true,
      message: "If an account exists, a verification email has been sent.",
    };
  }

  const token = await createVerificationToken(user.email);
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  const emailContent = buildVerificationEmail(user.name ?? "there", verifyUrl);

  await sendEmail({ to: user.email, ...emailContent });

  return { success: true, message: "Verification email sent." };
}

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "forgot-password", 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid email address" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.passwordHash) {
    const token = await createPasswordResetToken(email);
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    const emailContent = buildPasswordResetEmail(user.name ?? "there", resetUrl);

    await sendEmail({ to: email, ...emailContent });

    await createAuditLog({
      action: "PASSWORD_RESET",
      userId: user.id,
      metadata: { event: "reset_requested" },
      ipAddress: ip,
    });
  }

  return {
    success: true,
    message: "If an account exists, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "reset-password", 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { token, password } = parsed.data;
  const verification = await verifyResetToken(token);

  if (!verification.success) {
    return { success: false, error: verification.error };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { email: verification.email },
    data: {
      passwordHash,
      sessionVersion: { increment: 1 },
    },
  });

  await consumeResetToken(token);

  await createAuditLog({
    action: "PASSWORD_RESET",
    metadata: { event: "reset_completed", email: verification.email },
  });

  return { success: true, message: "Password reset successfully. You can now log in." };
}

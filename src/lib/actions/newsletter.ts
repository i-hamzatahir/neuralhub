"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import {
  deactivateSubscriber,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "@/lib/services/newsletter/newsletter.service";
import { subscribeNewsletterSchema } from "@/lib/validations/newsletter";

export type NewsletterActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export async function subscribeNewsletterAction(
  _prev: NewsletterActionResult,
  formData: FormData,
): Promise<NewsletterActionResult> {
  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "newsletter-subscribe", 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const parsed = subscribeNewsletterSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const session = await auth();
  const result = await subscribeToNewsletter(parsed.data, session?.user?.id);

  return {
    success: result.success,
    message: result.message,
  };
}

export async function unsubscribeNewsletterAction(formData: FormData) {
  const token = formData.get("token") as string;
  if (!token) {
    redirect("/newsletter?error=invalid");
  }

  const result = await unsubscribeFromNewsletter(token);
  if (!result.success) {
    redirect("/newsletter?error=invalid");
  }

  redirect("/newsletter?unsubscribed=1");
}

export async function adminDeactivateSubscriberAction(
  subscriberId: string,
): Promise<NewsletterActionResult> {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "EDITOR")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deactivateSubscriber(subscriberId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deactivate",
    };
  }
}

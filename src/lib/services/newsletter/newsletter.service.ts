import { prisma } from "@/lib/db/prisma";
import {
  createNewsletterConfirmToken,
  createNewsletterUnsubscribeToken,
  verifyNewsletterConfirmToken,
  verifyNewsletterUnsubscribeToken,
} from "@/lib/auth/tokens";
import {
  buildNewsletterConfirmEmail,
  buildNewsletterWelcomeEmail,
  sendEmail,
} from "@/lib/email/client";
import type { SubscribeNewsletterInput } from "@/lib/validations/newsletter";
import { trackEvent } from "@/lib/services/analytics/analytics.service";
import { getProductionAppUrl } from "@/lib/url";

async function syncUserNewsletterOptIn(email: string, optIn: boolean) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });

  if (!user) return;

  if (user.settings) {
    await prisma.userSettings.update({
      where: { userId: user.id },
      data: { newsletterOptIn: optIn },
    });
  } else {
    await prisma.userSettings.create({
      data: { userId: user.id, newsletterOptIn: optIn },
    });
  }
}

export async function subscribeToNewsletter(
  input: SubscribeNewsletterInput,
  userId?: string,
) {
  const email = input.email.toLowerCase().trim();
  const name = input.name?.trim() || undefined;
  const source = input.source ?? "newsletter-page";

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing?.isVerified && existing.isActive) {
    return {
      success: true as const,
      message: "You're already subscribed. Check your inbox for past issues.",
      alreadySubscribed: true,
    };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      name,
      source,
      isVerified: false,
      isActive: true,
      unsubscribedAt: null,
    },
    update: {
      name: name ?? existing?.name,
      source,
      isActive: true,
      unsubscribedAt: null,
    },
  });

  const confirmToken = await createNewsletterConfirmToken(email);
  const confirmUrl = `${getProductionAppUrl()}/newsletter/confirm?token=${confirmToken}`;
  const emailContent = buildNewsletterConfirmEmail(name ?? email, confirmUrl);

  await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  await trackEvent("newsletter.subscribed", {
    properties: { source },
  });

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email.toLowerCase() === email) {
      await syncUserNewsletterOptIn(email, true);
    }
  }

  return {
    success: true as const,
    message: "Check your inbox to confirm your subscription.",
    alreadySubscribed: false,
  };
}

export async function confirmNewsletterSubscription(token: string) {
  const result = await verifyNewsletterConfirmToken(token);
  if (!result.success) return result;

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: result.email },
  });

  if (!subscriber) {
    return { success: false as const, error: "Subscriber not found" };
  }

  await prisma.newsletterSubscriber.update({
    where: { email: result.email },
    data: {
      isVerified: true,
      isActive: true,
      unsubscribedAt: null,
    },
  });

  await syncUserNewsletterOptIn(result.email, true);

  const unsubscribeToken = await createNewsletterUnsubscribeToken(result.email);
  const unsubscribeUrl = `${getProductionAppUrl()}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const welcome = buildNewsletterWelcomeEmail(
    subscriber.name ?? result.email,
    unsubscribeUrl,
  );

  await sendEmail({
    to: result.email,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });

  return { success: true as const, email: result.email };
}

export async function unsubscribeFromNewsletter(token: string) {
  const result = await verifyNewsletterUnsubscribeToken(token);
  if (!result.success) return result;

  await prisma.newsletterSubscriber.updateMany({
    where: { email: result.email },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  await syncUserNewsletterOptIn(result.email, false);

  return { success: true as const, email: result.email };
}

export async function getNewsletterStats() {
  const [total, verified, active] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { isVerified: true } }),
    prisma.newsletterSubscriber.count({
      where: { isActive: true, isVerified: true },
    }),
  ]);

  return { total, verified, active };
}

export async function listNewsletterSubscribers({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const skip = (page - 1) * limit;

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.newsletterSubscriber.count(),
  ]);

  return { subscribers, total, pages: Math.ceil(total / limit) };
}

export async function deactivateSubscriber(subscriberId: string) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id: subscriberId },
  });

  if (!subscriber) throw new Error("Subscriber not found");

  await prisma.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  await syncUserNewsletterOptIn(subscriber.email, false);
}

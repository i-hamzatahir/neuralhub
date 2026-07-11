import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";

const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;
const NEWSLETTER_CONFIRM_EXPIRY_HOURS = 48;
const NEWSLETTER_UNSUBSCRIBE_EXPIRY_DAYS = 90;

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(email: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expires = new Date(
    Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: { identifier: email, token: tokenHash, expires },
  });

  return token;
}

export async function createPasswordResetToken(email: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `reset:${email}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  return token;
}

export async function createNewsletterConfirmToken(email: string) {
  const normalized = email.toLowerCase();
  const identifier = `newsletter:${normalized}`;
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expires = new Date(
    Date.now() + NEWSLETTER_CONFIRM_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  return token;
}

export async function createNewsletterUnsubscribeToken(email: string) {
  const normalized = email.toLowerCase();
  const identifier = `unsubscribe:${normalized}`;
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expires = new Date(
    Date.now() + NEWSLETTER_UNSUBSCRIBE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  return token;
}

async function findTokenRecord(token: string) {
  const tokenHash = hashToken(token);
  return prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });
}

export async function verifyEmailToken(token: string) {
  const record = await findTokenRecord(token);

  if (!record || record.expires < new Date()) {
    return { success: false as const, error: "Invalid or expired token" };
  }

  if (
    record.identifier.startsWith("reset:") ||
    record.identifier.startsWith("newsletter:") ||
    record.identifier.startsWith("unsubscribe:")
  ) {
    return { success: false as const, error: "Invalid token type" };
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token: record.token },
  });

  return { success: true as const, email: record.identifier };
}

export async function verifyResetToken(token: string) {
  const record = await findTokenRecord(token);

  if (!record || record.expires < new Date()) {
    return { success: false as const, error: "Invalid or expired token" };
  }

  if (!record.identifier.startsWith("reset:")) {
    return { success: false as const, error: "Invalid token type" };
  }

  const email = record.identifier.replace("reset:", "");
  return { success: true as const, email, token };
}

export async function verifyNewsletterConfirmToken(token: string) {
  const record = await findTokenRecord(token);

  if (!record || record.expires < new Date()) {
    return { success: false as const, error: "Invalid or expired token" };
  }

  if (!record.identifier.startsWith("newsletter:")) {
    return { success: false as const, error: "Invalid token type" };
  }

  const email = record.identifier.replace("newsletter:", "");

  await prisma.verificationToken.delete({
    where: { token: record.token },
  });

  return { success: true as const, email };
}

export async function verifyNewsletterUnsubscribeToken(token: string) {
  const record = await findTokenRecord(token);

  if (!record || record.expires < new Date()) {
    return { success: false as const, error: "Invalid or expired token" };
  }

  if (!record.identifier.startsWith("unsubscribe:")) {
    return { success: false as const, error: "Invalid token type" };
  }

  const email = record.identifier.replace("unsubscribe:", "");

  await prisma.verificationToken.delete({
    where: { token: record.token },
  });

  return { success: true as const, email };
}

export async function consumeResetToken(token: string) {
  const record = await findTokenRecord(token);
  if (record) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
  }
}

export async function generateUniqueUsername(base: string): Promise<string> {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 20) || "user";

  let username = sanitized;
  let attempt = 0;

  while (attempt < 100) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
    attempt++;
    username = `${sanitized}${attempt}`;
  }

  return `${sanitized}${Date.now()}`;
}

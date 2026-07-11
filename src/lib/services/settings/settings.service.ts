import { prisma } from "@/lib/db/prisma";

export async function getUserSettings(userId: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  return (
    settings ?? {
      theme: "system",
      emailNotifications: true,
      newsletterOptIn: false,
      profilePublic: true,
      language: "en",
    }
  );
}

export async function updateUserSettings(
  userId: string,
  data: {
    theme?: string;
    emailNotifications?: boolean;
    newsletterOptIn?: boolean;
    profilePublic?: boolean;
    language?: string;
  },
) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

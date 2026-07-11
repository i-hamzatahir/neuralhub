"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateUserSettings } from "@/lib/services/settings/settings.service";
import { z } from "zod";

const settingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  emailNotifications: z.coerce.boolean(),
  newsletterOptIn: z.coerce.boolean(),
  profilePublic: z.coerce.boolean(),
  language: z.string().min(2).max(10),
});

export type SettingsActionResult = {
  success: boolean;
  error?: string;
};

export async function saveSettingsAction(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = settingsSchema.safeParse({
    theme: formData.get("theme"),
    emailNotifications: formData.get("emailNotifications") === "on",
    newsletterOptIn: formData.get("newsletterOptIn") === "on",
    profilePublic: formData.get("profilePublic") === "on",
    language: formData.get("language"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid settings" };
  }

  try {
    await updateUserSettings(session.user.id, parsed.data);
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save",
    };
  }
}

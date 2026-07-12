/**
 * Personal blog mode — visitors read content; only the owner publishes.
 * Set NEXT_PUBLIC_PERSONAL_SITE=false to re-enable multi-user features later.
 */
export const isPersonalSite =
  process.env.NEXT_PUBLIC_PERSONAL_SITE !== "false";

export function isPublicRegistrationEnabled(
  settings?: Record<string, string>,
): boolean {
  if (isPersonalSite) return false;
  if (!settings) return false;
  return settings["site.registration_enabled"] === "true";
}

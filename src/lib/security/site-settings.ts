export function isSiteSettingEnabled(
  settings: Record<string, string>,
  key: string,
): boolean {
  const value = settings[key];
  return value === "true" || value === "1";
}

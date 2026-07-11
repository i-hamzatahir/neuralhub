/**
 * Validates callback/redirect URLs to prevent open redirects.
 * Only same-origin relative paths are allowed.
 */
export function sanitizeCallbackUrl(
  url: string | null | undefined,
  fallback = "/",
): string {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.hostname !== "localhost") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

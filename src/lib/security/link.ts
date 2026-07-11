const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "vbscript:", "file:"]);

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (BLOCKED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return false;
    }
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export const safeLinkConfig = {
  protocols: ["http", "https", "mailto"] as string[],
  validate: (url: string) => isSafeUrl(url),
};

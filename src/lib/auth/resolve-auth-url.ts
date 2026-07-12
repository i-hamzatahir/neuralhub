function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

function shouldPreferWww(hostname: string): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_WWW === "false") return false;
  if (process.env.NEXT_PUBLIC_FORCE_WWW === "true") return true;
  if (isLocalHost(hostname) || hostname.endsWith(".vercel.app")) return false;
  if (hostname.startsWith("www.")) return false;
  return process.env.NODE_ENV === "production";
}

function withWww(hostname: string): string {
  return hostname.startsWith("www.") ? hostname : `www.${hostname}`;
}

/**
 * Auth.js uses AUTH_URL for CSRF and callback URLs. It must match the host
 * users actually browse (e.g. www vs apex), or login cookies will not stick.
 */
export function resolveAuthUrl(): string {
  const explicit =
    process.env.CANONICAL_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_CANONICAL_URL?.trim();
  if (explicit) return normalizeUrl(explicit);

  const candidate =
    process.env.AUTH_URL?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    (process.env.VERCEL_URL
      ? `https://${normalizeUrl(process.env.VERCEL_URL)}`
      : "http://localhost:3000");

  try {
    const parsed = new URL(candidate);
    if (shouldPreferWww(parsed.hostname)) {
      parsed.hostname = withWww(parsed.hostname);
    }
    return normalizeUrl(parsed.toString());
  } catch {
    return normalizeUrl(candidate);
  }
}

let synced = false;

export function ensureAuthUrl(): string {
  const resolved = resolveAuthUrl();
  if (!synced) {
    process.env.AUTH_URL = resolved;
    synced = true;
  }
  return resolved;
}

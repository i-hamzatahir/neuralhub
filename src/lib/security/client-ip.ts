/**
 * Derive client IP without trusting spoofable headers unless behind a known proxy.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  if (process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true") {
    const vercelIp = headers.get("x-vercel-forwarded-for");
    if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? "unknown";

    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return headers.get("x-real-ip") ?? "unknown";
}

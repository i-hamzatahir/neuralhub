function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

/**
 * Resolve the public site URL at runtime (server-side).
 * Prefers AUTH_URL so email links work on Vercel even when
 * NEXT_PUBLIC_APP_URL was missing at build time.
 */
export function getAppUrl(): string {
  const fromAuth = process.env.AUTH_URL?.trim();
  if (fromAuth) return normalizeUrl(fromAuth);

  const fromPublic = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromPublic) return normalizeUrl(fromPublic);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${normalizeUrl(vercel)}`;

  return "http://localhost:3000";
}

/**
 * Use for transactional emails and auth redirects in production.
 * Throws when the resolved URL still points at localhost.
 */
export function getProductionAppUrl(): string {
  const url = getAppUrl();

  if (
    process.env.NODE_ENV === "production" &&
    isLocalUrl(url)
  ) {
    throw new Error(
      "Production app URL is misconfigured. Set AUTH_URL and NEXT_PUBLIC_APP_URL to https://your-domain.vercel.app on Vercel, then redeploy.",
    );
  }

  return url;
}

export function isProductionAppUrlMisconfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  return isLocalUrl(getAppUrl());
}

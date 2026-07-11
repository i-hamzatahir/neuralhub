import { createHmac, timingSafeEqual } from "crypto";

const VIEW_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required for view tokens");
    }
    return "dev-insecure-view-token-secret";
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createViewToken(viewId: string): string {
  const exp = Date.now() + VIEW_TOKEN_TTL_MS;
  const payload = `${viewId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyViewToken(viewId: string, token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [id, expStr, sig] = parts;
  if (id !== viewId) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const payload = `${id}.${expStr}`;
  const expected = sign(payload);

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

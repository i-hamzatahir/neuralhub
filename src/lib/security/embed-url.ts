const ALLOWED_EMBED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
]);

export function toSafeEmbedUrl(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.includes("youtube.com/watch")) {
      const id = new URL(trimmed).searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (trimmed.includes("youtu.be/")) {
      const id = trimmed.split("youtu.be/")[1]?.split(/[?#]/)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (trimmed.includes("vimeo.com/")) {
      const id = trimmed.split("vimeo.com/")[1]?.split(/[?#]/)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    const parsed = new URL(trimmed);
    if (
      parsed.protocol === "https:" &&
      ALLOWED_EMBED_HOSTS.has(parsed.hostname) &&
      (parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/video/"))
    ) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  title: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(title) || "untitled";
  let slug = base;
  let attempt = 0;

  while (attempt < 100) {
    const exists = await checkExists(slug);
    if (!exists) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

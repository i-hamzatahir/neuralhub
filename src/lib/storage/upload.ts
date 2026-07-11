import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  extensionForMime,
  validateImageBuffer,
} from "@/lib/security/image";

const MAX_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (file.size > MAX_SIZE) {
    throw new Error("File too large. Maximum size is 5MB");
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function uploadImage(
  file: File,
  userId: string,
): Promise<{ url: string; filename: string }> {
  validateImageFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = validateImageBuffer(buffer);
  const ext = extensionForMime(mime);
  const filename = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const supabase = getSupabase();

  if (process.env.NODE_ENV === "production" && !supabase) {
    throw new Error("File uploads are not configured");
  }

  if (supabase) {
    const { error } = await supabase.storage
      .from("media")
      .upload(filename, buffer, { contentType: mime, upsert: false });

    if (error) throw new Error("Upload failed");

    const { data } = supabase.storage.from("media").getPublicUrl(filename);
    return { url: data.publicUrl, filename };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
  await mkdir(uploadDir, { recursive: true });
  const localFilename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, localFilename);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${userId}/${localFilename}`,
    filename: localFilename,
  };
}

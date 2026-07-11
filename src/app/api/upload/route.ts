import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/auth/policies";
import { rateLimitByIp } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { uploadImage } from "@/lib/storage/upload";

async function getClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !hasMinRole(session.user, "AUTHOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = await getClientIp();
  const rateLimit = await rateLimitByIp(ip, "upload", 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { url, filename } = await uploadImage(file, session.user.id);

    await prisma.mediaFile.create({
      data: {
        filename,
        url,
        mimeType: file.type,
        size: file.size,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}

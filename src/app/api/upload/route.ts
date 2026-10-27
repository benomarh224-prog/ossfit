import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-utils";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (Number(req.headers.get("content-length")) > MAX_BYTES + 128 * 1024) {
    return NextResponse.json({ error: "Image too large (max 3 MB)" }, { status: 413 });
  }
  const recent = await db.uploadedFile.count({
    where: { ownerId: session.user.id, createdAt: { gte: new Date(Date.now() - 86400000) } },
  });
  if (recent >= 30) return NextResponse.json({ error: "Daily upload limit reached. Try again tomorrow." }, { status: 429 });
  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid upload" }, { status: 400 }); }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG or WEBP images are allowed" }, { status: 415 });
  }
  if (!file.size || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large or empty (max 3 MB)" }, { status: 413 });
  }

  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 20_000_000 })
      .rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).toBuffer();
  } catch {
    return NextResponse.json({ error: "This image could not be read. Choose another image." }, { status: 400 });
  }
  try {
    const blob = await put(`${session.user.id}/${randomUUID()}.webp`, image, {
      access: "private", contentType: "image/webp", addRandomSuffix: false,
    });
    try {
      const upload = await db.uploadedFile.create({ data: {
        ownerId: session.user.id, pathname: blob.pathname, contentType: "image/webp",
        size: image.length, visibility: session.user.role === "COACH" ? "PUBLIC" : "PRIVATE",
      } });
      return NextResponse.json({ url: `/api/uploads/${upload.id}`, size: image.length });
    } catch (error) {
      await del(blob.pathname).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("Image upload failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Upload is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

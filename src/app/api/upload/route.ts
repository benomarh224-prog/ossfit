import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG or WEBP images are allowed" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 6 MB)" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fname = `${session.user.id}-${Date.now()}-${hash}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fname), buf);

  return NextResponse.json({ url: `/uploads/${fname}`, size: buf.length });
}

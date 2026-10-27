import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { canReadUpload } from "@/lib/upload-access";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await db.uploadedFile.findUnique({ where: { id } });
  if (!file) return new NextResponse("Not found", { status: 404 });
  const session = file.visibility === "PUBLIC" ? null : await requireAuth();
  if (!canReadUpload(file, session?.user)) return new NextResponse("Not found", { status: 404 });
  try {
    const blob = await get(file.pathname, { access: "private" });
    if (!blob || blob.statusCode !== 200) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(blob.stream, { headers: {
      "Content-Type": file.contentType,
      "Cache-Control": file.visibility === "PUBLIC" ? "public, max-age=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    } });
  } catch {
    return new NextResponse("Image temporarily unavailable", { status: 503 });
  }
}

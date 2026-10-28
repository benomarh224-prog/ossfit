import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { canReadUpload, canReadPlanMedia } from "@/lib/upload-access";
import { parseByteRange } from "@/lib/media-policy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await db.uploadedFile.findUnique({ where: { id } });
  if (!file) return new NextResponse("Not found", { status: 404 });
  const session = file.visibility === "PUBLIC" ? null : await requireAuth();
  let assigned = false;
  if (session?.user.role === "CLIENT" && file.ownerId !== session.user.id) {
    const media = await db.planMedia.findUnique({ where: { uploadId: id }, include: { workoutPlan: true, nutritionPlan: true } });
    const plan = media?.workoutPlan ?? media?.nutritionPlan;
    assigned = canReadPlanMedia(plan, session.user);
  }
  if (!canReadUpload(file, session?.user, assigned)) return new NextResponse("Not found", { status: 404 });
  const range = parseByteRange(req.headers.get("range"), file.size);
  if (range === false) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${file.size}` } });
  try {
    const blob = await get(file.pathname, { access: "private", ...(range ? { headers: { Range: `bytes=${range.start}-${range.end}` } } : {}) });
    if (!blob || blob.statusCode !== 200) return new NextResponse("Not found", { status: 404 });
    const contentRange = blob.headers.get("content-range");
    return new NextResponse(blob.stream, { status: contentRange ? 206 : 200, headers: {
      "Content-Type": file.contentType,
      "Cache-Control": file.visibility === "PUBLIC" ? "public, max-age=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
      ...(contentRange ? { "Content-Range": contentRange } : {}),
      ...(blob.headers.get("content-length") ? { "Content-Length": blob.headers.get("content-length")! } : {}),
    } });
  } catch {
    return new NextResponse("File temporarily unavailable", { status: 503 });
  }
}

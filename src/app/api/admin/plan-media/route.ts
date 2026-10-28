import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";
import { mediaRegistrationSchema } from "@/lib/media-policy";
import { registerPlanMedia } from "@/lib/plan-media-server";

export async function POST(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = mediaRegistrationSchema.safeParse(await req.json().catch(() => null));
  if (!data.success) return NextResponse.json({ error: "Invalid media details" }, { status: 400 });
  try {
    await registerPlanMedia({ ...data.data, ownerId: session.user.id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to attach this file. Check its format and plan assignment, then retry." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireCoach()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== "string") return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  const media = await db.planMedia.findUnique({ where: { id: body.id }, include: { upload: true } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await del(media.upload.pathname);
    await db.uploadedFile.delete({ where: { id: media.uploadId } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to remove file. Please retry." }, { status: 503 }); }
}

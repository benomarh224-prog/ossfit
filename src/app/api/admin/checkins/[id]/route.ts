import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({ coachReply: z.string().trim().min(1).max(4000), expectedUpdatedAt: z.string().datetime() }).strict();
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a reply of 1–4000 characters." }, { status: 400 });
  try {
    const saved = await db.$transaction(async tx => {
      const current = await tx.checkIn.findUnique({ where: { id } });
      if (!current) return false;
      const update = await tx.checkIn.updateMany({ where: { id, updatedAt: new Date(parsed.data.expectedUpdatedAt) }, data: { coachReply: parsed.data.coachReply, status: "REVIEWED" } });
      if (!update.count) return false;
      await tx.notification.create({ data: { userId: current.userId, title: "Your coach reviewed your check-in", body: current.weekLabel, type: "checkin" } });
      return true;
    });
    if (!saved) return NextResponse.json({ error: "This check-in changed. Refresh and try again." }, { status: 409 });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to save your reply." }, { status: 503 }); }
}

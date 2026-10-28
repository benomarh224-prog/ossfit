import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "ACTIVE", "REJECTED", "PAUSED"]),
}).strict();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!await db.user.findFirst({ where: { id, role: "CLIENT" }, select: { id: true } })) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [checkIns, photos] = await Promise.all([
    db.checkIn.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.progressPhoto.findMany({ where: { userId: id }, orderBy: { takenAt: "desc" }, take: 12 }),
  ]);
  return NextResponse.json({ checkIns, photos }, { headers: { "Cache-Control": "private, no-store" } });
}

// PATCH — approve / reject / change status of a client profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }
  const { status } = parsed.data;

  const profile = await db.clientProfile.findUnique({ where: { userId: id } });
  if (!profile) return NextResponse.json({ error: "Client profile not found" }, { status: 404 });

  const updated = await db.clientProfile.update({
    where: { userId: id },
    data: { status },
  });

  // Approving an application is separate from verifying a payment.
  if (status === "ACTIVE" || status === "APPROVED") {
    await db.notification.create({
      data: {
        userId: id,
        title: "Your application has been approved",
        body: "Your assessment has been approved. Check your plans and confirm the next steps with your coach.",
        type: "info",
      },
    });
  }
  if (status === "REJECTED") {
    await db.notification.create({
      data: {
        userId: id,
        title: "Application update",
        body: "Your coaching application could not be approved at this time. Contact the coach for details.",
        type: "info",
      },
    });
  }

  return NextResponse.json({ ok: true, profile: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "ACTIVE", "REJECTED", "PAUSED"]).optional(),
});

// PATCH — approve / reject / change status of a client profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    data: { status: status ?? "ACTIVE" },
  });

  // if approved, activate their pending subscription
  if (status === "ACTIVE" || status === "APPROVED") {
    await db.subscription.updateMany({
      where: { userId: id, status: "PENDING" },
      data: { status: "ACTIVE", startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000) },
    });
    await db.notification.create({
      data: {
        userId: id,
        title: "Your application has been approved",
        body: "Welcome aboard! Your coaching program is now active.",
        type: "success",
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

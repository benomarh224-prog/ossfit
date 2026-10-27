import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "PENDING"]),
  coachNote: z.string().optional(),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payments = await db.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      subscription: { include: { package: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ payments });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;

  const payment = await db.payment.update({
    where: { id: id },
    data: { status: d.status, coachNote: d.coachNote },
    include: { subscription: true },
  });

  // activate subscription when verified
  if (d.status === "VERIFIED" && payment.subscription) {
    await db.subscription.update({
      where: { id: payment.subscription.id },
      data: { status: "ACTIVE", startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000) },
    });
    await db.clientProfile.update({
      where: { userId: payment.userId },
      data: { status: "ACTIVE" },
    }).catch(() => {});
    await db.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment verified — subscription active",
        body: `Your ${payment.packageTitle} subscription is now active. Let's go!`,
        type: "success",
      },
    });
  }
  if (d.status === "REJECTED") {
    await db.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment could not be verified",
        body: d.coachNote ?? "Please check your transfer details and contact the coach.",
        type: "warning",
      },
    });
  }

  return NextResponse.json({ ok: true, payment });
}

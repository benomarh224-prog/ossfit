import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"]),
  meetingLink: z.string().optional(),
  coachNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;

  const booking = await db.consultationBooking.update({
    where: { id: id },
    data: d,
    include: { user: { select: { id: true, name: true, email: true, phone: true } }, slot: true },
  });

  // free the slot if rejected/cancelled
  if (d.status === "REJECTED" || d.status === "CANCELLED") {
    await db.consultationSlot.update({
      where: { id: booking.slotId },
      data: { booked: false },
    });
  }

  await db.notification.create({
    data: {
      userId: booking.userId,
      title:
        d.status === "APPROVED"
          ? "Your consultation is approved"
          : d.status === "REJECTED"
          ? "Consultation request declined"
          : d.status === "COMPLETED"
          ? "Consultation completed"
          : "Consultation cancelled",
      body:
        d.status === "APPROVED" && d.meetingLink
          ? `Meeting link: ${d.meetingLink}`
          : d.coachNote ?? "See your dashboard for details.",
      type: "consultation",
    },
  });

  return NextResponse.json({ ok: true, booking });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const booking = await db.consultationBooking.findUnique({ where: { id: id } });
  if (booking) {
    await db.consultationSlot.update({
      where: { id: booking.slotId },
      data: { booked: false },
    }).catch(() => {});
    await db.consultationBooking.delete({ where: { id: id } });
  }
  return NextResponse.json({ ok: true });
}

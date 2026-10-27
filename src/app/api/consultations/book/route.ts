import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

const schema = z.object({
  slotId: z.string(),
  goals: z.string().min(10, "Please describe your goals").max(1000),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CLIENT") return NextResponse.json({ error: "Client account required" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const slot = await db.consultationSlot.findUnique({
    where: { id: parsed.data.slotId },
    include: { bookings: true },
  });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  const alreadyBooked =
    slot.booked ||
    slot.bookings.some((b) => b.status === "REQUESTED" || b.status === "APPROVED");
  if (alreadyBooked) return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });

  const booking = await db.$transaction(async (tx) => {
    const reserved = await tx.consultationSlot.updateMany({
      where: { id: slot.id, booked: false, start: { gt: new Date() } }, data: { booked: true },
    });
    if (reserved.count !== 1) return null;
    return tx.consultationBooking.create({ data: {
      userId: session.user.id, slotId: slot.id, goals: parsed.data.goals, status: "REQUESTED",
    } });
  });
  if (!booking) return NextResponse.json({ error: "This slot is no longer available. Choose another time." }, { status: 409 });

  // notify coach
  const coach = await db.user.findFirst({ where: { role: "COACH" } });
  if (coach) {
    await db.notification.create({
      data: {
        userId: coach.id,
        title: "New consultation request",
        body: `Goals: ${parsed.data.goals.slice(0, 80)}`,
        type: "consultation",
      },
    });
  }

  return NextResponse.json({ ok: true, booking });
}

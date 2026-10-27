import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET available consultation slots (next 30 days, Africa/Casablanca)
export async function GET() {
  const now = new Date();
  const max = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const slots = await db.consultationSlot.findMany({
    where: { start: { gte: now, lte: max } },
    include: { bookings: true },
    orderBy: { start: "asc" },
  });
  const data = slots.map((s) => ({
    id: s.id,
    start: s.start,
    end: s.end,
    booked: s.booked || s.bookings.some((b) => b.status === "REQUESTED" || b.status === "APPROVED"),
  }));
  return NextResponse.json({ slots: data });
}

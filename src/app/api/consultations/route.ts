import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "COACH") {
    const bookings = await db.consultationBooking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  const bookings = await db.consultationBooking.findMany({
    where: { userId: session.user.id },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}

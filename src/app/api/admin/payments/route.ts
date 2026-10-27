import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

// GET — list all payments for the coach dashboard (with user + subscription + package)
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

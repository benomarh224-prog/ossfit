import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

const schema = z.object({
  weekLabel: z.string().min(2),
  weightKg: z.number().min(30).max(250).optional(),
  sleepHours: z.number().min(0).max(16).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  adherencePercent: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.checkIn.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ checkIns: items });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const d = parsed.data;
  const checkIn = await db.checkIn.create({
    data: { ...d, userId: session.user.id, status: "SUBMITTED" },
  });

  const coach = await db.user.findFirst({ where: { role: "COACH" } });
  if (coach) {
    await db.notification.create({
      data: {
        userId: coach.id,
        title: "New weekly check-in",
        body: `${d.weekLabel} — adherence ${d.adherencePercent ?? "?"}%`,
        type: "checkin",
      },
    });
  }
  return NextResponse.json({ ok: true, checkIn });
}

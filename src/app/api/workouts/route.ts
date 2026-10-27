import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseJSON, toJSON } from "@/lib/server-utils";

// GET — client: my plans + log history; coach: all plans
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "COACH") {
    const plans = await db.workoutPlan.findMany({ orderBy: { createdAt: "desc" } });
    const library = await db.exerciseLibrary.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({
      plans: plans.map((p) => ({ ...p, days: parseJSON(p.daysJson, []) })),
      library,
    });
  }

  const plan = await db.workoutPlan.findFirst({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "desc" },
  });
  const logs = await db.workoutLog.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({
    plan: plan ? { ...plan, days: parseJSON(plan.daysJson, []) } : null,
    logs: logs.map((l) => ({ ...l, day: parseJSON(l.dayJson, {}) })),
  });
}

// POST — client logs a completed workout
const logSchema = z.object({
  planId: z.string().optional(),
  planTitle: z.string().optional(),
  dayJson: z.record(z.any()),
  durationMin: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = logSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const log = await db.workoutLog.create({
    data: {
      userId: session.user.id,
      planId: d.planId,
      planTitle: d.planTitle,
      dayJson: toJSON(d.dayJson),
      durationMin: d.durationMin,
      notes: d.notes,
    },
  });

  // notify coach
  const coach = await db.user.findFirst({ where: { role: "COACH" } });
  if (coach) {
    await db.notification.create({
      data: {
        userId: coach.id,
        title: "Workout logged",
        body: `${d.planTitle ?? "Session"} — ${d.durationMin ?? 0} min`,
        type: "workout",
      },
    });
  }

  return NextResponse.json({ ok: true, log });
}

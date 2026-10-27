import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON, parseJSON } from "@/lib/server-utils";

const schema = z.object({
  userId: z.string(),
  title: z.string().min(2),
  goal: z.string().optional(),
  summary: z.string().optional(),
  days: z.array(z.any()),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await db.workoutPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  const library = await db.exerciseLibrary.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({
    plans: plans.map((p) => ({ ...p, days: parseJSON(p.daysJson, []) })),
    library,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  // deactivate other active plans for this user
  if (d.active) {
    await db.workoutPlan.updateMany({ where: { userId: d.userId, active: true }, data: { active: false } });
  }
  const created = await db.workoutPlan.create({
    data: {
      userId: d.userId,
      title: d.title,
      goal: d.goal,
      summary: d.summary,
      daysJson: toJSON(d.days),
      active: d.active,
    },
  });
  await db.notification.create({
    data: {
      userId: d.userId,
      title: "New workout plan assigned",
      body: d.title,
      type: "workout",
    },
  });
  return NextResponse.json({ ok: true, plan: { ...created, days: parseJSON(created.daysJson, []) } });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON, parseJSON } from "@/lib/server-utils";

const schema = z.object({
  userId: z.string(),
  title: z.string().min(2),
  dailyCalories: z.number().int().optional(),
  proteinG: z.number().int().optional(),
  carbsG: z.number().int().optional(),
  fatsG: z.number().int().optional(),
  waterCupsGoal: z.number().int().optional(),
  meals: z.array(z.any()).default([]),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await db.nutritionPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({
    plans: plans.map((p) => ({ ...p, meals: parseJSON(p.mealsJson, []) })),
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
  if (d.active) {
    await db.nutritionPlan.updateMany({ where: { userId: d.userId, active: true }, data: { active: false } });
  }
  const created = await db.nutritionPlan.create({
    data: {
      userId: d.userId,
      title: d.title,
      dailyCalories: d.dailyCalories,
      proteinG: d.proteinG,
      carbsG: d.carbsG,
      fatsG: d.fatsG,
      waterCupsGoal: d.waterCupsGoal ?? 8,
      mealsJson: toJSON(d.meals),
      notes: d.notes,
      active: d.active,
    },
  });
  await db.notification.create({
    data: {
      userId: d.userId,
      title: "New nutrition plan assigned",
      body: d.title,
      type: "nutrition",
    },
  });
  return NextResponse.json({ ok: true, plan: { ...created, meals: parseJSON(created.mealsJson, []) } });
}

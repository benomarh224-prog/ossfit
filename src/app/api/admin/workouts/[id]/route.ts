import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach, parseJSON } from "@/lib/server-utils";
import { workoutEditSchema, editWorkoutPlan, PlanEditError } from "@/lib/plan-editor";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireCoach()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = workoutEditSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid plan" }, { status: 400 });
  try {
    const plan = await db.$transaction((tx) => editWorkoutPlan(tx, id, parsed.data));
    return NextResponse.json({ ok: true, plan: { ...plan, days: parseJSON(plan.daysJson, []) } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof PlanEditError ? error.message : "Unable to update the plan. Please retry." }, { status: error instanceof PlanEditError ? error.status : 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.workoutPlan.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}

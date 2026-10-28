import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { coachingDayRange } from "@/lib/coaching-day";

const schema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  description: z.string().min(2).max(300),
  calories: z.number().int().min(0).max(5000).optional(),
  proteinG: z.number().min(0).max(500).optional(),
  carbsG: z.number().min(0).max(500).optional(),
  fatsG: z.number().min(0).max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  let range;
  try { range = coachingDayRange(new Date(), dateParam ?? undefined); }
  catch { return NextResponse.json({ error: "Use a valid date in YYYY-MM-DD format." }, { status: 400 }); }

  const meals = await db.mealLog.findMany({
    where: { userId: session.user.id, date: { gte: range.start, lt: range.end } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ meals });
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

  const meal = await db.mealLog.create({
    data: { ...d, userId: session.user.id, date: new Date() },
  });
  return NextResponse.json({ ok: true, meal });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.mealLog.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

// GET today's water cups count
export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const logs = await db.waterLog.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
  });
  const cups = logs.reduce((sum, l) => sum + l.cups, 0);
  return NextResponse.json({ cups, logs });
}

// POST add one (or N) cup(s)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { cups?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body => add 1 cup */
  }
  const cups = Number.isInteger(body.cups) && body.cups! > 0 ? body.cups! : 1;

  const log = await db.waterLog.create({
    data: { userId: session.user.id, cups, date: new Date() },
  });
  return NextResponse.json({ ok: true, log });
}

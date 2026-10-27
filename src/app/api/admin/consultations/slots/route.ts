import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slots = await db.consultationSlot.findMany({
    include: { bookings: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { start: "asc" },
  });
  return NextResponse.json({ slots });
}

// create a batch of slots
export async function POST(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { starts?: string[] } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (!body.starts?.length) return NextResponse.json({ error: "starts required" }, { status: 400 });
  const created = [];
  for (const s of body.starts) {
    const start = new Date(s);
    if (isNaN(start.getTime())) continue;
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min slots
    const exists = await db.consultationSlot.findFirst({ where: { start, end } });
    if (!exists) {
      created.push(await db.consultationSlot.create({ data: { start, end } }));
    }
  }
  return NextResponse.json({ ok: true, created });
}

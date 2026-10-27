import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.workoutPlan.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  clientName: z.string().optional(),
  beforeImg: z.string().optional(),
  afterImg: z.string().optional(),
  goal: z.string().optional(),
  duration: z.string().optional(),
  story: z.string().optional(),
  published: z.boolean().optional(),
  consent: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const updated = await db.transformation.update({ where: { id: id }, data: parsed.data });
  return NextResponse.json({ ok: true, transformation: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.transformation.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}

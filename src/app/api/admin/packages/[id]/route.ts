import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON } from "@/lib/server-utils";

const schema = z.object({
  title: z.string().optional(),
  tagline: z.string().optional(),
  priceMAD: z.number().int().min(0).optional(),
  durationLabel: z.string().optional(),
  features: z.array(z.string()).optional(),
  supportLevel: z.string().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }
  const d = parsed.data;
  const data: any = { ...d };
  if (d.features) data.features = toJSON(d.features);

  const updated = await db.package.update({ where: { id: id }, data });
  return NextResponse.json({ ok: true, package: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.package.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}

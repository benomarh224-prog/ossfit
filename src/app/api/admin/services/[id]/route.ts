import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON } from "@/lib/server-utils";

const schema = z.object({
  title: z.string().optional(),
  shortDesc: z.string().optional(),
  longDesc: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
  const updated = await db.service.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, service: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.service.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

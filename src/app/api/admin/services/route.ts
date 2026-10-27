import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON, parseJSON } from "@/lib/server-utils";

const schema = z.object({
  title: z.string().min(2),
  shortDesc: z.string().min(2),
  longDesc: z.string().min(2),
  icon: z.string().default("dumbbell"),
  image: z.string().optional(),
  features: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({
    services: services.map((s) => ({ ...s, features: parseJSON<string[]>(s.features, []) })),
  });
}

export async function POST(req: NextRequest) {
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
  const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const created = await db.service.create({
    data: { ...d, slug, features: toJSON(d.features) },
  });
  return NextResponse.json({ ok: true, service: created });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach, toJSON, parseJSON } from "@/lib/server-utils";

const schema = z.object({
  title: z.string().min(2),
  tagline: z.string().min(2),
  priceMAD: z.number().int().min(0),
  durationLabel: z.string().default("Per month"),
  features: z.array(z.string()),
  supportLevel: z.string().default("Standard support"),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const packages = await db.package.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({
    packages: packages.map((p) => ({ ...p, features: parseJSON<string[]>(p.features, []) })),
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
  const created = await db.package.create({
    data: {
      ...d,
      slug,
      features: toJSON(d.features),
    },
  });
  return NextResponse.json({ ok: true, package: created });
}

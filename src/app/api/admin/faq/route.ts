import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";

const schema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  category: z.string().default("General"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.fAQ.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ faqs: items });
}

export async function POST(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const created = await db.fAQ.create({ data: parsed.data });
  return NextResponse.json({ ok: true, faq: created });
}

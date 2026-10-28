import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [notifications, unread] = await Promise.all([
    db.notification.findMany({ where: { userId: session.user.id }, select: { id: true, title: true, body: true, type: true, read: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);
  return NextResponse.json({ notifications, unread }, { headers: { "Cache-Control": "private, no-store" } });
}

const schema = z.object({ ids: z.array(z.string().min(1).max(100)).min(1).max(30) }).strict();
export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  await db.notification.updateMany({ where: { userId: session.user.id, id: { in: parsed.data.ids }, read: false }, data: { read: true } });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

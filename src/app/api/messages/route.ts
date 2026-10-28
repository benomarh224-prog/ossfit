import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { allowRequest } from "@/lib/rate-limit";
import { conversationAccess, messageSchema } from "@/lib/messages-policy";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["COACH", "CLIENT"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (session.user.role === "COACH" && !clientId) {
    // Counts only, so opening the inbox does not mark a conversation as read.
    const grouped = await db.message.groupBy({ by: ["clientId"], where: { coachId: session.user.id, sender: "CLIENT", read: false }, _count: { _all: true } });
    return NextResponse.json({ threads: grouped.map(g => ({ clientId: g.clientId, unread: g._count._all })) }, { headers: noStore });
  }
  const where = conversationAccess(session.user, clientId);
  if (!where) return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
  const before = req.nextUrl.searchParams.get("before");
  if (before && !await db.message.findFirst({ where: { ...where, id: before }, select: { id: true } })) return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  const rows = await db.message.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 51, ...(before ? { cursor: { id: before }, skip: 1 } : {}) });
  const more = rows.length > 50; const page = rows.slice(0, 50);
  // Mark only displayed inbound messages. A new message arriving concurrently stays unread.
  await db.message.updateMany({ where: { ...where, id: { in: page.map(m => m.id) }, sender: session.user.role === "COACH" ? "CLIENT" : "COACH", read: false }, data: { read: true } });
  return NextResponse.json({ messages: page.reverse(), nextCursor: more ? rows[49].id : null }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!await allowRequest("messages", session.user.id, 30, 60_000)) return NextResponse.json({ error: "Too many messages. Try again shortly." }, { status: 429 });
  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a message of 1–4000 characters." }, { status: 400 });
  const where = conversationAccess(session.user, parsed.data.clientId);
  if (!where) return NextResponse.json({ error: "Invalid conversation" }, { status: 403 });
  const client = await db.user.findFirst({ where: { id: where.clientId, role: "CLIENT" }, select: { id: true } });
  const coach = session.user.role === "COACH" ? { id: session.user.id } : await db.user.findFirst({ where: { role: "COACH" }, select: { id: true } });
  if (!client || !coach) return NextResponse.json({ error: "Conversation unavailable" }, { status: 404 });
  const sender = session.user.role === "COACH" ? "COACH" : "CLIENT";
  const message = await db.$transaction(async tx => {
    const message = await tx.message.create({ data: { coachId: coach.id, clientId: client.id, sender, body: parsed.data.body } });
    await tx.notification.create({ data: { userId: sender === "CLIENT" ? coach.id : client.id, title: sender === "CLIENT" ? "New client message" : "New message from your coach", body: parsed.data.body.slice(0, 120), type: "message" } });
    return message;
  });
  return NextResponse.json({ ok: true, message }, { headers: noStore });
}

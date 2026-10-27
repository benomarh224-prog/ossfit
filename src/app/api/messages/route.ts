import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

// GET conversation between current user and the coach (or all conversations for the coach)
export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "COACH") {
    // Return a list of clients who have exchanged messages, with last message
    const msgs = await db.message.findMany({
      where: { coachId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, name: true, email: true } } },
    });
    const map = new Map<string, { client: any; lastMessage: any; unread: number }>();
    for (const m of msgs) {
      const existing = map.get(m.clientId);
      if (!existing) {
        map.set(m.clientId, {
          client: m.client,
          lastMessage: m,
          unread: m.sender === "CLIENT" && !m.read ? 1 : 0,
        });
      } else if (m.sender === "CLIENT" && !m.read) {
        existing.unread++;
      }
    }
    return NextResponse.json({ threads: Array.from(map.values()) });
  }

  // Client: return their thread with the coach
  const messages = await db.message.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  const coach = await db.user.findFirst({ where: { role: "COACH" }, select: { id: true, name: true } });
  // mark client's inbound messages as read
  await db.message.updateMany({
    where: { clientId: session.user.id, sender: "COACH", read: false },
    data: { read: true },
  });
  return NextResponse.json({ messages, coach });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { body?: string; clientId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const text = (body.body ?? "").trim();
  if (!text) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  let coachId: string;
  let clientId: string;
  let sender: "COACH" | "CLIENT";

  if (session.user.role === "COACH") {
    coachId = session.user.id;
    clientId = body.clientId ?? "";
    sender = "COACH";
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  } else {
    clientId = session.user.id;
    const coach = await db.user.findFirst({ where: { role: "COACH" }, select: { id: true } });
    if (!coach) return NextResponse.json({ error: "No coach found" }, { status: 500 });
    coachId = coach.id;
    sender = "CLIENT";
  }

  const msg = await db.message.create({
    data: { coachId, clientId, sender, body: text },
  });

  // create a notification for the recipient
  await db.notification.create({
    data: {
      userId: sender === "CLIENT" ? coachId : clientId,
      title: sender === "CLIENT" ? "New client message" : "New message from your coach",
      body: text.slice(0, 120),
      type: "message",
    },
  });

  return NextResponse.json({ ok: true, message: msg });
}

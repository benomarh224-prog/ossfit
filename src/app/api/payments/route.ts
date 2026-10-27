import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";

const schema = z.object({
  subscriptionId: z.string().optional(),
  packageTitle: z.string().min(2),
  amountMAD: z.number().int().positive(),
  proofUrl: z.string().optional(),
  method: z.string().default("BANK_TRANSFER"),
});

// POST — client records a payment (manual bank transfer with proof upload)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Only clients may record payments here" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  const payment = await db.payment.create({
    data: {
      userId: session.user.id,
      subscriptionId: d.subscriptionId,
      packageTitle: d.packageTitle,
      amountMAD: d.amountMAD,
      method: d.method,
      proofUrl: d.proofUrl,
      invoiceNo,
      status: "PENDING",
    },
  });

  // notify coach
  const coach = await db.user.findFirst({ where: { role: "COACH" } });
  if (coach) {
    await db.notification.create({
      data: {
        userId: coach.id,
        title: "New payment to verify",
        body: `${d.packageTitle} — ${d.amountMAD} MAD`,
        type: "payment",
      },
    });
  }

  return NextResponse.json({ ok: true, payment });
}

// GET — client sees own payments; coach sees all
export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "COACH") {
    const payments = await db.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { package: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payments });
  }

  const payments = await db.payment.findMany({
    where: { userId: session.user.id },
    include: { subscription: { include: { package: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ payments });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/server-utils";
import { recordPayment } from "@/lib/payment-record";
import { PaymentReviewError } from "@/lib/payment-review";

const schema = z.object({
  packageId: z.string().min(1),
  subscriptionId: z.string().optional(),
  proofUrl: z.string().regex(/^\/api\/uploads\/[a-zA-Z0-9_-]+$/),
});

// POST — client records a payment (manual bank transfer with proof upload)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CLIENT")
    return NextResponse.json({ error: "Only clients may record payments here" }, { status: 403 });

  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

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

  const [pkg, proof, requestedSub] = await Promise.all([
    db.package.findFirst({ where: { id: d.packageId, available: true } }),
    db.uploadedFile.findFirst({ where: { id: d.proofUrl.split("/").pop(), ownerId: session.user.id, visibility: "PRIVATE" } }),
    d.subscriptionId ? db.subscription.findFirst({ where: { id: d.subscriptionId, userId: session.user.id, packageId: d.packageId } }) : Promise.resolve(null),
  ]);
  if (!pkg) return NextResponse.json({ error: "This package is no longer available" }, { status: 400 });
  if (!proof) return NextResponse.json({ error: "Upload your payment proof first" }, { status: 400 });
  if (d.subscriptionId && !requestedSub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  try {
    const payment = await db.$transaction(tx => recordPayment(tx, { userId: session.user.id, packageId: pkg.id, packageTitle: pkg.title, priceMAD: pkg.priceMAD, proofUrl: d.proofUrl, subscriptionId: d.subscriptionId }));
    return NextResponse.json({ ok: true, payment }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PaymentReviewError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Unable to submit payment. Try again." }, { status: 503 });
  }
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

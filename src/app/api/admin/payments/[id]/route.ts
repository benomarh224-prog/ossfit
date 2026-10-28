import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";
import { PaymentReviewError, reviewPayment } from "@/lib/payment-review";

const schema = z.object({ status: z.enum(["VERIFIED", "REJECTED"]), coachNote: z.string().max(2000).optional() }).strict();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  try {
    const payment = await db.$transaction(tx => reviewPayment(tx, id, parsed.data));
    return NextResponse.json({ ok: true, payment }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PaymentReviewError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Unable to review payment. Try again." }, { status: 503 });
  }
}

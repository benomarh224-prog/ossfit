import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { InvalidRecoveryToken, consumeRecoveryToken, resetPasswordSchema } from "@/lib/account-recovery";

export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ code: "ORIGIN" }, { status: 403 });
  try {
    if (!await allowRequest("password-reset", requestIp(req.headers), 10, 15 * 60_000))
      return NextResponse.json({ code: "RATE_LIMIT" }, { status: 429 });
    const parsed = resetPasswordSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ code: "INVALID" }, { status: 400 });
    // Never log bearer tokens or return account details, including account roles.
    const hash = await bcrypt.hash(parsed.data.password, 12);
    await db.$transaction(tx => consumeRecoveryToken(tx, parsed.data.token, hash));
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof InvalidRecoveryToken) return NextResponse.json({ code: "EXPIRED" }, { status: 400 });
    return NextResponse.json({ code: "FAILED" }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCoach } from "@/lib/server-utils";
import { allowRequest } from "@/lib/rate-limit";
import { newRecoveryToken, recoveryRequestSchema } from "@/lib/account-recovery";
import { siteOrigin } from "@/lib/site-url";

const schema = recoveryRequestSchema.extend({ clientId: z.string().min(1).max(100).optional() }).strict();

export async function POST(req: NextRequest) {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin || !req.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ code: "ORIGIN" }, { status: 403 });
  try {
    if (!await allowRequest("issue-recovery", session.user.id, 10, 15 * 60_000)) return NextResponse.json({ code: "RATE_LIMIT" }, { status: 429 });
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ code: "INVALID" }, { status: 400 });
    const coach = await db.user.findUnique({ where: { id: session.user.id } });
    if (!coach || coach.sessionVersion !== session.user.sessionVersion || !coach.password || !await bcrypt.compare(parsed.data.currentPassword, coach.password))
      return NextResponse.json({ code: "PASSWORD" }, { status: 400 });
    const target = parsed.data.clientId ? await db.user.findFirst({ where: { id: parsed.data.clientId, role: "CLIENT" } }) : coach;
    if (!target) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    const { token, record } = newRecoveryToken(target.id, target.sessionVersion, !parsed.data.clientId);
    await db.$transaction(async tx => {
      // Recheck the issuer under lock so an in-flight request cannot outlive revocation.
      const current = await tx.$queryRaw<{ sessionVersion: number }[]>`SELECT "sessionVersion" FROM "User" WHERE "id" = ${coach.id} AND "role" = 'COACH' FOR UPDATE`;
      if (current[0]?.sessionVersion !== coach.sessionVersion) throw new Error("Revoked issuer");
      await tx.passwordResetToken.upsert({ where: { userId: target.id }, create: record, update: record });
    });
    return NextResponse.json({ token, url: `${siteOrigin()}/reset-password#token=${token}`, expiresAt: record.expiresAt }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ code: "FAILED" }, { status: 503 });
  }
}

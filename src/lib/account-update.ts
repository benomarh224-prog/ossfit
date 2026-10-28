import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth, requireCoach } from "@/lib/server-utils";
import { allowRequest } from "@/lib/rate-limit";
import { accountChangeSchema } from "@/lib/account-security";

export async function updateAccount(req: NextRequest, coachOnly = false) {
  const session = await (coachOnly ? requireCoach() : requireAuth());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["COACH", "CLIENT"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // JSON and an explicit same-origin check protect this cookie-authenticated mutation.
  if (!req.headers.get("content-type")?.startsWith("application/json") ||
      req.headers.get("origin") !== new URL(req.url).origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  if (!await allowRequest("account-change", session.user.id, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes.", code: "RATE_LIMIT" }, { status: 429 });
  }
  const parsed = accountChangeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your email and password. New passwords need at least 12 characters and at most 72 UTF-8 bytes.", code: "INVALID" }, { status: 400 });
  const { email, currentPassword, newPassword } = parsed.data;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.sessionVersion !== session.user.sessionVersion) {
    return NextResponse.json({ error: "Your account changed. Sign in again.", code: "STALE" }, { status: 401 });
  }
  if (!user?.password || !await bcrypt.compare(currentPassword, user.password)) {
    return NextResponse.json({ error: "Current password is incorrect.", code: "PASSWORD" }, { status: 400 });
  }
  if (email === user.email && !newPassword) {
    return NextResponse.json({ error: "Enter a different email or a new password.", code: "UNCHANGED" }, { status: 400 });
  }
  const password = newPassword ? await bcrypt.hash(newPassword, 12) : user.password;
  try {
    // Compare the version as well as incrementing it: concurrent credential updates
    // must not overwrite a change made after this request authenticated.
    const updated = await db.user.updateMany({
      where: { id: user.id, role: session.user.role, password: user.password, sessionVersion: user.sessionVersion },
      data: { email, password, emailVerified: email === user.email ? user.emailVerified : null, sessionVersion: { increment: 1 } },
    });
    if (!updated.count) return NextResponse.json({ error: "Your account changed. Sign in again.", code: "STALE" }, { status: 409 });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "This email is already in use.", code: "EMAIL" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to update your account. Try again.", code: "FAILED" }, { status: 503 });
  }
}

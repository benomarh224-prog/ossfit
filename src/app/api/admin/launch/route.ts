import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteContent, requireCoach } from "@/lib/server-utils";
import { launchChecks } from "@/lib/launch-readiness";

export async function GET() {
  const session = await requireCoach();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [content, packages, key] = await Promise.all([
    getSiteContent(),
    db.package.count({ where: { available: true } }),
    db.passwordResetToken.findFirst({ where: { userId: session.user.id, sessionVersion: session.user.sessionVersion, expiresAt: { gt: new Date() } }, select: { userId: true } }),
  ]);
  return NextResponse.json({ checks: launchChecks(content, packages, !!key, !!process.env.BLOB_READ_WRITE_TOKEN) }, { headers: { "Cache-Control": "private, no-store" } });
}

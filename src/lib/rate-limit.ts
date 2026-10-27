import { createHash } from "node:crypto";
import { db } from "@/lib/db";

// Fixed windows stored in PostgreSQL so limits apply across Vercel instances.
export async function allowRequest(scope: string, ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const fingerprint = createHash("sha256").update(`${process.env.NEXTAUTH_SECRET}:${ip}`).digest("hex").slice(0, 32);
  const counter = await db.rateLimit.upsert({
    where: { id: `${scope}:${fingerprint}:${bucket}` },
    create: { id: `${scope}:${fingerprint}:${bucket}`, count: 1, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { count: { increment: 1 } },
  });
  if (counter.count === 1) await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  return counter.count <= limit;
}

export function requestIp(headers: Headers) {
  return (headers.get("x-vercel-forwarded-for") || headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
}

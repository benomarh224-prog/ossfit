import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  password: z.string().min(12).max(72).refine(value => new TextEncoder().encode(value).length <= 72),
}).strict();

export const recoveryRequestSchema = z.object({ currentPassword: z.string().min(1).max(256) }).strict();
export const resetTokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function newRecoveryToken(userId: string, sessionVersion: number, isCoach: boolean, now = new Date()) {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    record: { tokenHash: resetTokenHash(token), userId, sessionVersion,
      expiresAt: new Date(now.getTime() + (isCoach ? 365 * 24 * 60 : 15) * 60_000) },
  };
}

export class InvalidRecoveryToken extends Error {}

// Call inside a transaction. Claim once, compare the account version, then revoke sessions.
export async function consumeRecoveryToken(tx: Prisma.TransactionClient, token: string, passwordHash: string, now = new Date()) {
  const tokenHash = resetTokenHash(token);
  const record = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt <= now) throw new InvalidRecoveryToken();
  const claimed = await tx.passwordResetToken.deleteMany({ where: { tokenHash, expiresAt: { gt: now } } });
  if (claimed.count !== 1) throw new InvalidRecoveryToken();
  const result = await tx.user.updateMany({
    where: { id: record.userId, sessionVersion: record.sessionVersion, role: { in: ["COACH", "CLIENT"] } },
    data: { password: passwordHash, sessionVersion: { increment: 1 } },
  });
  if (result.count !== 1) throw new InvalidRecoveryToken();
  await tx.notification.create({ data: { userId: record.userId, title: "Password updated", body: "Your password was reset and previous sessions were signed out.", type: "security" } });
}

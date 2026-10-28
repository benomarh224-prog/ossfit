import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { PaymentReviewError } from "./payment-review.ts";

export async function recordPayment(tx: Prisma.TransactionClient, input: { userId: string; packageId: string; packageTitle: string; priceMAD: number; proofUrl: string; subscriptionId?: string }) {
  const locked = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "User" WHERE "id" = ${input.userId} AND "role" = 'CLIENT' FOR UPDATE`;
  if (!locked.length) throw new PaymentReviewError("Client not found", 404);
  const existing = await tx.payment.findFirst({ where: { userId: input.userId, proofUrl: input.proofUrl }, include: { subscription: true } });
  if (existing) {
    if (existing.status === "REJECTED") throw new PaymentReviewError("Upload a new proof after checking your transfer with the coach.");
    if (existing.subscription?.packageId !== input.packageId) throw new PaymentReviewError("This proof was already submitted for another package.");
    return existing;
  }
  const pending = await tx.payment.findFirst({ where: { userId: input.userId, status: "PENDING", subscription: { packageId: input.packageId } } });
  if (pending) throw new PaymentReviewError("A payment for this package is already awaiting verification. Contact the coach before submitting another proof.");
  const requested = input.subscriptionId ? await tx.subscription.findFirst({ where: { id: input.subscriptionId, userId: input.userId, packageId: input.packageId } }) : null;
  if (input.subscriptionId && !requested) throw new PaymentReviewError("Subscription not found", 404);
  const subscription = requested ?? await tx.subscription.findFirst({ where: { userId: input.userId, packageId: input.packageId, status: "PENDING" } }) ?? await tx.subscription.create({ data: { userId: input.userId, packageId: input.packageId, amountMAD: input.priceMAD, status: "PENDING" } });
  // A displayed package price must match the amount recorded for a pending contract.
  if (subscription.amountMAD !== input.priceMAD) throw new PaymentReviewError("The package price changed. Confirm the amount with the coach before submitting proof.");
  const payment = await tx.payment.create({ data: { userId: input.userId, subscriptionId: subscription.id, packageTitle: input.packageTitle, amountMAD: subscription.amountMAD, proofUrl: input.proofUrl, method: "BANK_TRANSFER", invoiceNo: `INV-${randomUUID().slice(0, 12).toUpperCase()}`, status: "PENDING" } });
  const coach = await tx.user.findFirst({ where: { role: "COACH" }, select: { id: true } });
  if (coach) await tx.notification.create({ data: { userId: coach.id, title: "New payment to verify", body: `${payment.packageTitle} — ${payment.amountMAD} MAD`, type: "payment" } });
  return payment;
}

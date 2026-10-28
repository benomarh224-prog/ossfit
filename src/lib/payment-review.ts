import type { Prisma } from "@prisma/client";

export class PaymentReviewError extends Error {
  status: number;
  constructor(message: string, status = 409) { super(message); this.status = status; }
}

// Run inside a transaction. Replaying an approval must never extend the subscription again.
export async function reviewPayment(tx: Prisma.TransactionClient, id: string, input: { status: "VERIFIED" | "REJECTED"; coachNote?: string }, now = new Date()) {
  const locked = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Payment" WHERE "id" = ${id} FOR UPDATE`;
  if (!locked.length) throw new PaymentReviewError("Payment not found", 404);
  const payment = await tx.payment.findUniqueOrThrow({ where: { id } });
  if (payment.status !== "PENDING") {
    if (payment.status === input.status) return payment;
    throw new PaymentReviewError("This payment has already been reviewed. Refresh the page.");
  }
  if (input.status === "VERIFIED") {
    if (!payment.subscriptionId) throw new PaymentReviewError("Payment has no subscription", 400);
    await tx.$queryRaw`SELECT "id" FROM "Subscription" WHERE "id" = ${payment.subscriptionId} FOR UPDATE`;
    const subscription = await tx.subscription.findUnique({ where: { id: payment.subscriptionId } });
    if (!subscription || subscription.userId !== payment.userId || subscription.amountMAD !== payment.amountMAD)
      throw new PaymentReviewError("Payment does not match the subscription", 400);
    const continuing = subscription.status === "ACTIVE" && !!subscription.endDate && subscription.endDate > now;
    const end = continuing ? subscription.endDate! : now;
    await tx.subscription.update({ where: { id: subscription.id }, data: {
      status: "ACTIVE", startDate: continuing ? subscription.startDate ?? now : now,
      endDate: new Date(end.getTime() + 30 * 86400000),
    } });
    await tx.clientProfile.updateMany({ where: { userId: payment.userId }, data: { status: "ACTIVE" } });
  }
  const updated = await tx.payment.update({ where: { id }, data: { status: input.status, coachNote: input.coachNote } });
  await tx.notification.create({ data: {
    userId: payment.userId,
    title: input.status === "VERIFIED" ? "Payment verified — subscription active" : "Payment could not be verified",
    body: input.status === "VERIFIED" ? `Your ${payment.packageTitle} subscription is active.` : input.coachNote || "Please check your transfer details and contact the coach.",
    type: "payment",
  } });
  return updated;
}

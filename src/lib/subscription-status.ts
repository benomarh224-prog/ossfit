// Display expiry from the date even when no scheduled maintenance job has run.
export function withSubscriptionStatus<T extends { status: string; endDate: Date | string | null }>(subscription: T, now = new Date()): T {
  return subscription.status === "ACTIVE" && subscription.endDate && new Date(subscription.endDate) <= now ? { ...subscription, status: "EXPIRED" } : subscription;
}

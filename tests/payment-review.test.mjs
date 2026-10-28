import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewPayment, PaymentReviewError } from '../src/lib/payment-review.ts';
import { recordPayment } from '../src/lib/payment-record.ts';

const now = new Date('2026-10-28T12:00:00Z');
function fixture(options = {}) {
  const payment = { id: 'payment', userId: 'alice', subscriptionId: 'sub', status: 'PENDING', amountMAD: 399, packageTitle: 'Basic', ...options.payment };
  const sub = { id: 'sub', userId: 'alice', packageId: 'pkg', amountMAD: 399, status: 'PENDING', ...options.sub };
  const notifications = []; const subscriptions = [];
  const tx = {
    $queryRaw: async () => options.missing ? [] : [{ id: 'payment' }],
    payment: { findUniqueOrThrow: async () => payment, update: async ({ data }) => Object.assign(payment, data) },
    subscription: { findUnique: async () => sub, update: async ({ data }) => { subscriptions.push(data); Object.assign(sub, data); } },
    clientProfile: { updateMany: async () => ({ count: 1 }) },
    notification: { create: async ({ data }) => notifications.push(data) },
  };
  return { tx, payment, sub, notifications, subscriptions };
}
test('payment review activates once, and retrying approval preserves dates without duplicate notifications', async () => {
  const f = fixture();
  await reviewPayment(f.tx, 'payment', { status: 'VERIFIED' }, now);
  const end = f.sub.endDate.getTime();
  assert.equal(f.sub.status, 'ACTIVE'); assert.equal(end, now.getTime() + 30 * 86400000);
  await reviewPayment(f.tx, 'payment', { status: 'VERIFIED' }, new Date(now.getTime() + 86400000));
  assert.equal(f.sub.endDate.getTime(), end); assert.equal(f.notifications.length, 1);
  await assert.rejects(() => reviewPayment(f.tx, 'payment', { status: 'REJECTED' }, now), PaymentReviewError);
});
test('renewal preserves remaining paid days and rejected payments never activate service', async () => {
  const start = new Date('2026-10-01T12:00:00Z'); const end = new Date('2026-11-01T12:00:00Z');
  const f = fixture({ sub: { status: 'ACTIVE', startDate: start, endDate: end } });
  await reviewPayment(f.tx, 'payment', { status: 'VERIFIED' }, now);
  assert.equal(f.sub.startDate, start); assert.equal(f.sub.endDate.getTime(), end.getTime() + 30 * 86400000);
  const rejected = fixture(); await reviewPayment(rejected.tx, 'payment', { status: 'REJECTED', coachNote: 'Check amount' }, now);
  assert.equal(rejected.sub.status, 'PENDING'); assert.equal(rejected.subscriptions.length, 0);
  assert.equal(rejected.notifications[0].body, 'Check amount');
});
test('unmatched amounts, ownership and missing payments cannot be approved', async () => {
  for (const options of [{ missing: true }, { sub: { userId: 'bob' } }, { sub: { amountMAD: 699 } }, { payment: { subscriptionId: null } }]) {
    const f = fixture(options);
    await assert.rejects(() => reviewPayment(f.tx, 'payment', { status: 'VERIFIED' }, now), PaymentReviewError);
    assert.equal(f.subscriptions.length, 0); assert.equal(f.notifications.length, 0);
  }
});
test('submitting the same proof returns the existing payment without creating another or notifying again', async () => {
  const existing = { id: 'paid', status: 'PENDING', subscription: { packageId: 'pkg' } };
  let writes = 0;
  const tx = { $queryRaw: async () => [{ id: 'alice' }], payment: { findFirst: async () => existing, create: async () => writes++ } };
  const input = { userId: 'alice', packageId: 'pkg', packageTitle: 'Basic', priceMAD: 399, proofUrl: '/api/uploads/proof' };
  assert.equal(await recordPayment(tx, input), existing); assert.equal(writes, 0);
  existing.status = 'REJECTED'; await assert.rejects(() => recordPayment(tx, input), PaymentReviewError);
  existing.status = 'VERIFIED'; existing.subscription.packageId = 'other'; await assert.rejects(() => recordPayment(tx, input), PaymentReviewError);
});

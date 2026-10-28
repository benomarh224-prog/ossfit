import test from 'node:test';
import assert from 'node:assert/strict';
import { withSubscriptionStatus } from '../src/lib/subscription-status.ts';

test('dated active subscriptions show expired at their end date without changing the database record', () => {
  const now = new Date('2026-10-28T12:00:00Z');
  const original = { status: 'ACTIVE', endDate: now.toISOString(), id: 'sub' };
  assert.equal(withSubscriptionStatus(original, now).status, 'EXPIRED');
  assert.equal(original.status, 'ACTIVE');
  for (const sub of [{ status: 'ACTIVE', endDate: null }, { status: 'ACTIVE', endDate: new Date(now.getTime() + 1) }, { status: 'PENDING', endDate: now }, { status: 'CANCELLED', endDate: now }]) assert.equal(withSubscriptionStatus(sub, now), sub);
});

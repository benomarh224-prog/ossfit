import test from 'node:test';
import assert from 'node:assert/strict';
import { coachingDayRange, coachingDateKey } from '../src/lib/coaching-day.ts';
import { nextWorkout, latestCoachUpdate, nextOverviewStep } from '../src/lib/dashboard-overview.ts';
import { overviewSnapshot } from '../src/lib/overview-snapshot.ts';

test('coaching days roll over at Casablanca midnight rather than server midnight', () => {
  const range = coachingDayRange(new Date('2026-10-28T23:30:00Z'));
  assert.equal(range.key, '2026-10-29');
  assert.equal(range.start.toISOString(), '2026-10-28T23:00:00.000Z');
  assert.equal(range.end.toISOString(), '2026-10-29T23:00:00.000Z');
});

test('day bounds cover the local day across offset changes and reject malformed calendar dates', () => {
  const lengths = new Set();
  for (let n = 0; n < 365; n++) {
    const now = new Date(Date.UTC(2026, 0, n + 1, 12));
    const range = coachingDayRange(now);
    assert.equal(coachingDateKey(range.start), range.key);
    assert.equal(coachingDateKey(new Date(range.end.getTime() - 1)), range.key);
    assert.notEqual(coachingDateKey(range.end), range.key);
    assert.ok(range.start <= now && now < range.end);
    lengths.add((range.end - range.start) / 3600000);
  }
  assert.deepEqual([...lengths].sort(), [23, 24, 25]);
  for (const value of ['2026-02-30', '2026-13-01', 'not-a-date', '2026-10-28T10:00:00Z']) assert.throws(() => coachingDayRange(new Date(), value));
});

const plan = { id: 'assigned', days: [{ name: 'Day 1' }, { name: 'Day 2' }, { name: 'Day 3' }] };
const log = { planId: 'assigned', day: { name: 'Day 2' }, completedAt: '2026-10-27T18:00:00Z' };
test('the next session follows the assigned plan sequence, including legacy day names and completed cycles', () => {
  assert.deepEqual(nextWorkout(plan, log, '2026-10-28'), { index: 2, completedToday: false });
  assert.equal(nextWorkout(plan, { ...log, day: { day: 'Day 3' } }, '2026-10-28').index, 0);
  for (const previous of [null, { ...log, planId: 'different-plan' }, { ...log, day: { name: 'renamed' } }]) assert.equal(nextWorkout(plan, previous, '2026-10-28').index, 0);
  assert.deepEqual(nextWorkout(null, log, '2026-10-28'), { index: 0, completedToday: false });
});

test('a logged session is recognized in the coaching day without assigning a fabricated weekday schedule', () => {
  const result = nextWorkout(plan, { ...log, completedAt: '2026-10-28T23:30:00Z' }, '2026-10-29');
  assert.equal(result.completedToday, true);
  assert.equal(result.index, 2);
});

test('latest coach update compares messages with check-in feedback and preserves the correct destination', () => {
  const message = { body: 'Private advice', createdAt: new Date('2026-10-28T12:00:00Z') };
  const reply = { coachReply: '  Check-in feedback  ', weekLabel: 'Week 1', updatedAt: new Date('2026-10-28T13:00:00Z') };
  assert.equal(latestCoachUpdate(message, reply).kind, 'checkin');
  assert.equal(latestCoachUpdate(message, reply).body, 'Check-in feedback');
  assert.equal(latestCoachUpdate(message, { ...reply, updatedAt: '2026-10-27T13:00:00Z' }).kind, 'message');
  assert.equal(latestCoachUpdate(message, { ...reply, coachReply: '' }).kind, 'message');
  assert.equal(latestCoachUpdate(null, null), null);
});

const ready = { profileStatus: 'ACTIVE', subscriptionStatus: 'ACTIVE', pendingPayment: false, unread: 0, hasWorkout: true, hasNutrition: true, completedToday: false, checkinAt: null, profileCreatedAt: '2026-10-28T10:00:00Z', now: '2026-10-28T12:00:00Z' };
test('next actions respect review and payment states, then offer messages, training and check-ins', () => {
  for (const [overrides, expected] of [
    [{ profileStatus: 'PENDING' }, 'assessment'], [{ profileStatus: 'PAUSED' }, 'contact'],
    [{ pendingPayment: true }, 'paymentPending'], [{ subscriptionStatus: 'EXPIRED' }, 'paymentNeeded'],
    [{ unread: 2 }, 'messages'], [{ hasWorkout: false, hasNutrition: false }, 'planPending'],
    [{}, 'workout'], [{ completedToday: true, profileCreatedAt: '2026-10-01T10:00:00Z' }, 'checkin'],
    [{ completedToday: true }, 'nutrition'], [{ completedToday: true, hasNutrition: false }, 'progress'],
  ]) assert.equal(nextOverviewStep({ ...ready, ...overrides }).kind, expected);
  assert.equal(nextOverviewStep({ ...ready, subscriptionStatus: 'PENDING', pendingPayment: true }).section, 'subscription');
});

function fixture({ noPlan = false, malformedLog = false } = {}) {
  const queries = [];
  const track = (model, result) => async args => { queries.push({ model, ...args }); return result; };
  const db = {
    workoutPlan: { findFirst: track('plan', noPlan ? null : { id: 'assigned' }) },
    workoutLog: { findFirst: track('workout', { planId: 'assigned', dayJson: malformedLog ? '{bad' : '{"name":"Day 2"}', completedAt: new Date(log.completedAt) }) },
    mealLog: { aggregate: track('meal', { _count: { _all: 2 }, _sum: { calories: null, proteinG: 0 } }) },
    waterLog: { aggregate: track('water', { _sum: { cups: 3 } }) },
    message: { findFirst: track('message', { body: 'Only this client', createdAt: new Date('2026-10-28T12:00:00Z') }) },
    checkIn: { findFirst: async args => { queries.push({ model: 'checkin', ...args }); return args.where.coachReply ? null : { createdAt: new Date('2026-10-21T12:00:00Z') }; } },
  };
  return { db, queries };
}

test('daily snapshot scopes every read to the authenticated client and never marks messages as read', async () => {
  const f = fixture();
  const snapshot = await overviewSnapshot(f.db, 'alice', new Date(ready.now));
  for (const query of f.queries) assert.equal(query.where.userId ?? query.where.clientId, 'alice');
  assert.equal(f.queries.find(q => q.model === 'workout').where.planId, 'assigned');
  const meal = f.queries.find(q => q.model === 'meal');
  assert.equal(meal.where.date.gte.toISOString(), '2026-10-27T23:00:00.000Z');
  assert.equal(meal.where.date.lt.toISOString(), '2026-10-28T23:00:00.000Z');
  assert.equal(snapshot.meals.count, 2); assert.equal(snapshot.meals.calories, null); assert.equal(snapshot.meals.proteinG, 0);
  assert.equal(snapshot.waterCups, 3); assert.equal(snapshot.latestWorkout.day.name, 'Day 2');
  assert.equal(snapshot.coachUpdate.kind, 'message');
});

test('a client without an active plan and a malformed legacy log both retain a usable daily overview', async () => {
  const noPlan = fixture({ noPlan: true });
  assert.equal((await overviewSnapshot(noPlan.db, 'alice')).latestWorkout, null);
  assert.equal(noPlan.queries.some(q => q.model === 'workout'), false);
  const broken = fixture({ malformedLog: true });
  assert.deepEqual((await overviewSnapshot(broken.db, 'alice')).latestWorkout.day, {});
});

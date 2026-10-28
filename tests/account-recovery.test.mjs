import test from 'node:test';
import assert from 'node:assert/strict';
import { newRecoveryToken, resetTokenHash, resetPasswordSchema, consumeRecoveryToken, InvalidRecoveryToken } from '../src/lib/account-recovery.ts';

const now = new Date('2026-10-28T12:00:00Z');

test('recovery secrets are random and only their SHA-256 hashes are stored', () => {
  const first = newRecoveryToken('client-a', 3, false, now);
  const second = newRecoveryToken('client-a', 3, false, now);
  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first.token, second.token);
  assert.equal(first.record.tokenHash, resetTokenHash(first.token));
  assert.equal(JSON.stringify(first.record).includes(first.token), false);
  assert.equal(first.record.sessionVersion, 3);
  assert.equal(first.record.expiresAt.getTime() - now.getTime(), 15 * 60_000);
  const coach = newRecoveryToken('coach', 0, true, now);
  assert.equal(coach.record.expiresAt.getTime() - now.getTime(), 365 * 24 * 60 * 60_000);
});

function fixture({ expired = false, version = 3, role = 'CLIENT', missing = false, claimLost = false } = {}) {
  const { token, record } = newRecoveryToken('client-a', 3, false, now);
  if (expired) record.expiresAt = now;
  const user = { id: 'client-a', sessionVersion: version, role, password: 'old' };
  let stored = missing ? null : record;
  const notices = [];
  const tx = {
    passwordResetToken: {
      findUnique: async ({ where }) => stored?.tokenHash === where.tokenHash ? stored : null,
      deleteMany: async ({ where }) => {
        if (claimLost || !stored || stored.tokenHash !== where.tokenHash || stored.expiresAt <= where.expiresAt.gt) return { count: 0 };
        stored = null; return { count: 1 };
      },
    },
    user: { updateMany: async ({ where, data }) => {
      if (user.id !== where.id || user.sessionVersion !== where.sessionVersion || !where.role.in.includes(user.role)) return { count: 0 };
      user.password = data.password; user.sessionVersion += data.sessionVersion.increment; return { count: 1 };
    } },
    notification: { create: async ({ data }) => notices.push(data) },
  };
  return { tx, token, user, notices };
}

test('reset changes only the original account password, revokes sessions and consumes the key once', async () => {
  for (const role of ['CLIENT', 'COACH']) {
    const f = fixture({ role });
    await consumeRecoveryToken(f.tx, f.token, 'new-bcrypt-hash', now);
    assert.equal(f.user.password, 'new-bcrypt-hash');
    assert.equal(f.user.sessionVersion, 4);
    assert.equal(f.user.role, role);
    assert.equal(f.notices[0].userId, 'client-a');
    await assert.rejects(() => consumeRecoveryToken(f.tx, f.token, 'replay', now), InvalidRecoveryToken);
    assert.equal(f.user.password, 'new-bcrypt-hash');
  }
});

test('expired, replaced, revoked or concurrently consumed keys cannot change credentials', async () => {
  for (const options of [{ expired: true }, { missing: true }, { version: 4 }, { claimLost: true }, { role: 'ADMIN' }]) {
    const f = fixture(options);
    await assert.rejects(() => consumeRecoveryToken(f.tx, f.token, 'wrong', now), InvalidRecoveryToken);
    assert.equal(f.user.password, 'old');
    assert.equal(f.notices.length, 0);
  }
  const f = fixture();
  await assert.rejects(() => consumeRecoveryToken(f.tx, 'invalid-secret', 'wrong', now), InvalidRecoveryToken);
});

test('reset validation rejects short or overlong UTF-8 passwords and injected account fields', () => {
  const token = newRecoveryToken('user', 0, false).token;
  assert.equal(resetPasswordSchema.safeParse({ token, password: 'strong-password-123' }).success, true);
  for (const password of ['short', 'a'.repeat(73), 'ع'.repeat(37)]) assert.equal(resetPasswordSchema.safeParse({ token, password }).success, false);
  for (const extra of [{ userId: 'other' }, { role: 'COACH' }, { email: 'other@example.com' }]) assert.equal(resetPasswordSchema.safeParse({ token, password: 'strong-password-123', ...extra }).success, false);
});

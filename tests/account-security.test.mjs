import test from 'node:test';
import assert from 'node:assert/strict';
import { accountChangeSchema, isSessionCurrent } from '../src/lib/account-security.ts';

test('account changes require the current password and normalize the email', () => {
  const parsed = accountChangeSchema.parse({ email: ' Coach@Example.com ', currentPassword: 'current-password' });
  assert.equal(parsed.email, 'coach@example.com');
  assert.equal(parsed.newPassword, undefined);
  assert.equal(accountChangeSchema.safeParse({ email: 'coach@example.com' }).success, false);
  assert.equal(accountChangeSchema.safeParse({ email: 'invalid', currentPassword: 'current' }).success, false);
});

test('new passwords enforce length and bcrypt byte limits without silently truncating Unicode', () => {
  const check = (newPassword) => accountChangeSchema.safeParse({ email: 'coach@example.com', currentPassword: 'old', newPassword }).success;
  assert.equal(check('short'), false);
  assert.equal(check('x'.repeat(72)), true);
  assert.equal(check('x'.repeat(73)), false);
  assert.equal(check('س'.repeat(36)), true);
  assert.equal(check('س'.repeat(37)), false);
});

test('credential changes revoke old and legacy sessions while allowing a fresh login', () => {
  assert.equal(isSessionCurrent(undefined, 0), true);
  assert.equal(isSessionCurrent(undefined, 1), false);
  assert.equal(isSessionCurrent(0, 1), false);
  assert.equal(isSessionCurrent(1, 1), true);
  assert.equal(isSessionCurrent(1, 2), false);
});

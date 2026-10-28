import test from 'node:test';
import assert from 'node:assert/strict';
import { loginPortalAllowsRole, signedInDestination } from '../src/lib/login-access.ts';

test('the administration login accepts coach accounts and rejects subscriber credentials', () => {
  assert.equal(loginPortalAllowsRole('COACH', 'admin'), true);
  assert.equal(loginPortalAllowsRole('CLIENT', 'admin'), false);
  assert.equal(loginPortalAllowsRole('ADMIN', 'admin'), false);
  assert.equal(loginPortalAllowsRole('', 'admin'), false);
});

test('ordinary sign-in supports both known roles without granting privileges from a portal value', () => {
  for (const role of ['COACH', 'CLIENT']) {
    assert.equal(loginPortalAllowsRole(role, undefined), true);
    assert.equal(loginPortalAllowsRole(role, ''), true);
    assert.equal(loginPortalAllowsRole(role, 'COACH'), false);
    assert.equal(loginPortalAllowsRole(role, '/admin'), false);
  }
  assert.equal(loginPortalAllowsRole('ADMIN', undefined), false);
});

test('anonymous, expired and incomplete sessions cannot enter the coach workspace', () => {
  for (const user of [undefined, null, {}, { role: 'COACH' }, { id: '', role: 'COACH' }, { id: 'expired', role: '' }]) {
    assert.equal(signedInDestination(user), null);
  }
});

test('switching between subscriber and coach selects the destination of the new session', () => {
  assert.deepEqual([
    { id: 'subscriber', role: 'CLIENT' },
    { id: 'coach', role: 'COACH' },
    { id: '', role: '' },
    { id: 'subscriber', role: 'CLIENT' },
  ].map(signedInDestination), ['/', '/admin', null, '/']);
});

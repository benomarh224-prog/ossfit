import test from 'node:test';
import assert from 'node:assert/strict';
import { launchChecks } from '../src/lib/launch-readiness.ts';

test('launch checks expose missing business information and never treat sample imagery as a coach portrait', () => {
  const content = { brandName: 'COACH OUSSAMA', coachName: 'Oussama', coachCity: 'Morocco', whatsappNumber: '+212610296995', whatsappEnabled: true, coachPortrait: '/images/service-coaching.jpg', bankName: null, bankAccountName: null, bankIban: null, bankRIB: null };
  const checks = launchChecks(content, 3, false, true);
  assert.equal(checks.identity, true); assert.equal(checks.contact, true);
  for (const key of ['city', 'portrait', 'bank', 'recovery']) assert.equal(checks[key], false);
  const complete = launchChecks({ ...content, coachCity: 'Tetouan', coachPortrait: '/api/uploads/real-photo', bankName: 'Bank', bankAccountName: 'Coach', bankRIB: 'example-only' }, 1, true, true);
  assert.equal(Object.values(complete).every(Boolean), true);
  assert.equal(launchChecks({ ...content, whatsappEnabled: false }, 0, false, false).contact, false);
});

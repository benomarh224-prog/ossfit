import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidMoroccanPhone, normalizeMoroccanPhone } from '../src/lib/phone.ts';
test('phone numbers pasted from messaging apps accept spaces, directional marks and Unicode hyphens', () => {
  const number = '\u202a+212\u00a0610‑296995\u202c';
  assert.equal(isValidMoroccanPhone(number), true);
  assert.equal(normalizeMoroccanPhone(number), '+212610296995');
});
test('local and country-code formats normalize to the same number', () => {
  for (const number of ['0610296995', '212610296995', '+212610296995']) {
    assert.equal(isValidMoroccanPhone(number), true);
    assert.equal(normalizeMoroccanPhone(number), '+212610296995');
  }
});
test('invalid or foreign numbers are rejected', () => {
  for (const number of ['0610', '+33610296995', '+212410296995', 'not-a-number']) assert.equal(isValidMoroccanPhone(number), false);
});

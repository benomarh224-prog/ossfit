import test from 'node:test';
import assert from 'node:assert/strict';
import { canReadUpload } from '../src/lib/upload-access.ts';
import { publicSiteContent } from '../src/lib/site-content.ts';

const privateImage = { visibility: 'PRIVATE', ownerId: 'client-one' };
test('anonymous visitors cannot read a private image', () => assert.equal(canReadUpload(privateImage, null), false));
test('another client cannot read a private image', () => assert.equal(canReadUpload(privateImage, { id: 'client-two', role: 'CLIENT' }), false));
test('the owner can read their image', () => assert.equal(canReadUpload(privateImage, { id: 'client-one', role: 'CLIENT' }), true));
test('the coach can review private payment and progress images', () => assert.equal(canReadUpload(privateImage, { id: 'coach-one', role: 'COACH' }), true));
test('a role without a valid account id cannot read private images', () => assert.equal(canReadUpload(privateImage, { id: '', role: 'COACH' }), false));
test('published marketing images are accessible to visitors', () => assert.equal(canReadUpload({ visibility: 'PUBLIC', ownerId: 'coach-one' }, null), true));
test('public content omits all bank account fields without changing marketing content', () => {
  const content = { brandName: 'Coach', heroTitle: 'A personal plan', bankName: 'Private bank', bankAccountName: 'Beneficiary', bankIban: 'Private IBAN', bankRIB: 'Private RIB' };
  const result = publicSiteContent(content);
  assert.deepEqual(result, { brandName: 'Coach', heroTitle: 'A personal plan' });
  assert.equal(content.bankIban, 'Private IBAN');
});

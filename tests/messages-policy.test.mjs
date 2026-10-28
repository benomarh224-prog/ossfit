import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationAccess, messageSchema } from '../src/lib/messages-policy.ts';

test('clients can only access their own thread even when another client ID is supplied', () => {
  assert.deepEqual(conversationAccess({ id: 'alice', role: 'CLIENT' }, 'bob'), { clientId: 'alice' });
  assert.deepEqual(conversationAccess({ id: 'coach', role: 'COACH' }, 'alice'), { coachId: 'coach', clientId: 'alice' });
  for (const viewer of [{ id: '', role: 'CLIENT' }, { id: 'user', role: 'ADMIN' }, { id: 'user', role: 'unknown' }]) assert.equal(conversationAccess(viewer, 'alice'), null);
  assert.equal(conversationAccess({ id: 'coach', role: 'COACH' }), null);
});

test('messages are bounded, trimmed, and cannot inject sender or coach identity', () => {
  assert.equal(messageSchema.parse({ body: '  Hello  ' }).body, 'Hello');
  for (const body of ['', '  ', 'a'.repeat(4001), 42]) assert.equal(messageSchema.safeParse({ body }).success, false);
  for (const extra of [{ sender: 'COACH' }, { coachId: 'other-coach' }]) assert.equal(messageSchema.safeParse({ body: 'hello', ...extra }).success, false);
});

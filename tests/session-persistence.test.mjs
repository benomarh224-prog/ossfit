import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import callbackModule from '../node_modules/next-auth/core/routes/callback.js';
import sessionModule from '../node_modules/next-auth/core/routes/session.js';
import cookieModule from '../node_modules/next-auth/core/lib/cookie.js';
import jwt from 'next-auth/jwt';
import { SESSION_MAX_AGE } from '../src/lib/session-policy.ts';
import { loginPortalAllowsRole, signedInDestination } from '../src/lib/login-access.ts';

// Exercise the installed session/cookie implementation with local fixture accounts only.
const callback = callbackModule.default;
const readSession = sessionModule.default;
const { defaultCookies, SessionStore } = cookieModule;
function fixture() {
  const cookies = defaultCookies(true);
  const logger = { debug() {}, error() {}, warn() {} };
  const options = {
    provider: { id: 'credentials', type: 'credentials', authorize: async credentials => {
      if (credentials.password !== 'fixture-password') return null;
      const role = credentials.email === 'coach@example.test' ? 'COACH' : 'CLIENT';
      return loginPortalAllowsRole(role, credentials.portal) ? { id: role === 'COACH' ? 'coach' : 'client', email: credentials.email, role } : null;
    } },
    callbacks: { signIn: async () => true, jwt: async ({ token, user }) => user ? { ...token, id: user.id, role: user.role } : token, session: async ({ session, token }) => ({ ...session, user: { ...session.user, id: token.id, role: token.role } }) },
    session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE }, jwt: { ...jwt, maxAge: SESSION_MAX_AGE, secret: randomBytes(32).toString('hex') },
    cookies, events: {}, url: 'https://coaching.example.test', callbackUrl: 'https://coaching.example.test/account', logger,
  };
  const store = values => new SessionStore(cookies.sessionToken, { cookies: values ?? {} }, logger);
  const signIn = (email, password = 'fixture-password', portal, values) => callback({ options, query: {}, body: { email, password, portal }, method: 'POST', headers: {}, sessionStore: store(values) });
  const values = response => Object.fromEntries(response.cookies.filter(cookie => cookie.value).map(cookie => [cookie.name, cookie.value]));
  return { options, store, signIn, values };
}

test('sign-in issues a secure persistent 30-day cookie that can resume the account on another request', async () => {
  const f = fixture(); const before = Date.now();
  const login = await f.signIn('client@example.test');
  const cookie = login.cookies.find(cookie => cookie.value);
  assert.equal(cookie.options.httpOnly, true); assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, 'lax'); assert.equal(cookie.options.path, '/');
  assert.ok(cookie.options.expires.getTime() >= before + SESSION_MAX_AGE * 1000 - 1000);
  const stored = f.values(login);
  const payload = await jwt.decode({ ...f.options.jwt, token: f.store(stored).value });
  assert.ok(Math.abs(payload.exp - payload.iat - SESSION_MAX_AGE) <= 1);
  const resumed = await readSession({ options: f.options, sessionStore: f.store(stored) });
  assert.equal(resumed.body.user.id, 'client');
  assert.equal(signedInDestination(resumed.body.user), '/account');
  assert.ok(resumed.cookies.some(cookie => cookie.value && cookie.options.expires));
});

test('a failed account switch leaves the previously remembered account intact', async () => {
  const f = fixture(); const stored = f.values(await f.signIn('client@example.test'));
  const failed = await f.signIn('coach@example.test', 'wrong-password', 'admin', stored);
  assert.equal(failed.status, 401); assert.deepEqual(failed.cookies, []);
  const denied = await f.signIn('client@example.test', 'fixture-password', 'admin', stored);
  assert.equal(denied.status, 401); assert.deepEqual(denied.cookies, []);
  const resumed = await readSession({ options: f.options, sessionStore: f.store(stored) });
  assert.equal(resumed.body.user.role, 'CLIENT');
});

test('a successful explicit switch replaces the browser cookie with the correctly authorized account', async () => {
  const f = fixture(); const stored = f.values(await f.signIn('client@example.test'));
  const switched = await f.signIn('coach@example.test', 'fixture-password', 'admin', stored);
  const resumed = await readSession({ options: f.options, sessionStore: f.store(f.values(switched)) });
  assert.equal(resumed.body.user.id, 'coach');
  assert.equal(signedInDestination(resumed.body.user), '/admin');
});

test('a tampered remembered cookie cannot grant account access and is cleared', async () => {
  const f = fixture(); const cookieName = f.options.cookies.sessionToken.name;
  const response = await readSession({ options: f.options, sessionStore: f.store({ [cookieName]: 'tampered-cookie' }) });
  assert.deepEqual(response.body, {});
  assert.ok(response.cookies.some(cookie => cookie.name === cookieName && cookie.options.maxAge === 0));
});

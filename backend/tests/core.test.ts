import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/lib/auth';

// HTTP contract tests with a deliberately isolated in-memory Prisma double.
// They never read .env or connect to a database. Real PostgreSQL integration is separate.
test('core HTTP contracts, authentication and authorization', async t => {
  process.env.JWT_SECRET = randomBytes(48).toString('hex');
  const users: any[] = [
    { id: 'admin', email: 'admin@test.vn', name: 'Admin', role: 'admin', is_locked: false, password_hash: await bcrypt.hash('password', 4) },
    { id: 'user', email: 'user@test.vn', name: 'User', role: 'user', is_locked: false, password_hash: await bcrypt.hash('password', 4) },
  ];
  const places: any[] = [{ id: 'p1', name: 'Beach', is_active: true }, { id: 'p2', name: 'Hidden', is_active: false }];
  const select = (u: any, selection: any) => !u ? null : selection ? Object.fromEntries(Object.keys(selection).map(k => [k, u[k]])) : { ...u };
  const patch = (object: any, method: string, implementation: any) => {
    const original = object[method];
    object[method] = implementation;
    t.after(() => { object[method] = original; });
  };
  patch(prisma.user, 'findUnique', async ({ where, select: selection }: any) => select(users.find(u => where.id ? u.id === where.id : u.email === where.email), selection));
  patch(prisma.user, 'findMany', async ({ select: selection }: any) => users.map(u => select(u, selection)));
  patch(prisma.user, 'create', async ({ data, select: selection }: any) => {
    const u = { id: 'new', role: 'user', is_locked: false, ...data }; users.push(u); return select(u, selection);
  });
  patch(prisma.user, 'update', async ({ where, data, select: selection }: any) => {
    const u = users.find(u => u.id === where.id); Object.assign(u, data); return select(u, selection);
  });
  patch(prisma.place, 'findMany', async ({ where }: any) => places.filter(p => where.is_active === undefined || p.is_active === where.is_active));
  patch(prisma.place, 'findFirst', async ({ where }: any) => places.find(p => p.id === where.id && (where.is_active === undefined || p.is_active === where.is_active)) || null);
  patch(prisma.place, 'create', async ({ data }: any) => { const p = { id: 'created', ...data }; places.push(p); return p; });
  patch(prisma.place, 'update', async ({ where, data }: any) => { const p = places.find(p => p.id === where.id); Object.assign(p, data); return p; });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const call = async (path: string, method = 'GET', body?: unknown, token?: string) => {
    const response = await fetch(`http://127.0.0.1:${address.port}/api${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() as any };
  };
  const admin = signToken('admin');
  const user = signToken('user');
  try {
    await t.test('public list/detail hide inactive places; admin list requires current admin role', async () => {
      assert.equal((await call('/places')).body.data.length, 1);
      assert.equal((await call('/places/p2')).status, 404);
      assert.equal((await call('/places?include_inactive=true')).status, 401);
      assert.equal((await call('/places?include_inactive=true', 'GET', undefined, user)).status, 403);
      assert.equal((await call('/places?include_inactive=true', 'GET', undefined, admin)).body.data.length, 2);
      assert.equal((await call('/places?area=invalid')).status, 400);
    });
    await t.test('register validates, normalizes email, hashes password and ignores injected role', async () => {
      assert.equal((await call('/auth/register', 'POST', { email: 'bad', password: 'password' })).status, 400);
      const result = await call('/auth/register', 'POST', { name: 'New User', email: ' NEW@Test.vn ', password: 'password', role: 'admin' });
      assert.equal(result.status, 201);
      assert.equal(result.body.data.user.email, 'new@test.vn');
      assert.equal(result.body.data.user.role, 'user');
      assert.equal(result.body.data.user.password_hash, undefined);
      assert.ok(await bcrypt.compare('password', users.find(u => u.id === 'new').password_hash));
      assert.equal((await call('/auth/register', 'POST', { name: 'New User', email: 'new@test.vn', password: 'password' })).status, 409);
    });
    await t.test('login/me reject bad, expired and forged tokens; never expose password hash', async () => {
      assert.equal((await call('/auth/login', 'POST', { email: 'user@test.vn', password: 'wrongpass' })).status, 401);
      const login = await call('/auth/login', 'POST', { email: 'USER@test.vn', password: 'password' });
      assert.equal(login.status, 200);
      const me = await call('/auth/me', 'GET', undefined, login.body.data.token);
      assert.equal(me.body.data.id, 'user'); assert.equal(me.body.data.password_hash, undefined);
      assert.equal((await call('/auth/me')).status, 401);
      assert.equal((await call('/auth/me', 'GET', undefined, user + 'x')).status, 401);
      const expired = jwt.sign({}, process.env.JWT_SECRET!, { subject: 'user', expiresIn: -1, issuer: 'vivu-api', audience: 'vivu-client' });
      assert.equal((await call('/auth/me', 'GET', undefined, expired)).status, 401);
    });
    await t.test('admin CRUD validates coordinates, protects routes, and DELETE only hides', async () => {
      const data = { area: 'danang', category: 'beach', name: 'Test', type: 'Beach', description: 'Description', image: '', lat: 16, lng: 108 };
      assert.equal((await call('/places', 'POST', data)).status, 401);
      assert.equal((await call('/places', 'POST', data, user)).status, 403);
      assert.equal((await call('/places', 'POST', { ...data, lat: 91 }, admin)).status, 400);
      assert.equal((await call('/places', 'POST', data, admin)).status, 201);
      assert.equal((await call('/places/created', 'PUT', { name: 'Renamed' }, admin)).body.data.name, 'Renamed');
      assert.equal((await call('/places/p1', 'DELETE', undefined, admin)).body.data.is_active, false);
      assert.equal(places.length, 3); // physical row preserved, no cascading delete
      assert.equal((await call('/places/p1/toggle', 'PATCH', { is_active: true }, admin)).body.data.is_active, true);
    });
    await t.test('lock immediately blocks login and existing JWT; admin accounts cannot be locked', async () => {
      assert.equal((await call('/users', 'GET', undefined, user)).status, 403);
      const list = await call('/users', 'GET', undefined, admin);
      assert.equal(list.status, 200); assert.ok(list.body.data.every((u: any) => !('password_hash' in u)));
      assert.equal((await call('/users/user/lock', 'PATCH', { is_locked: 'yes' }, admin)).status, 400);
      assert.equal((await call('/users/admin/lock', 'PATCH', { is_locked: true }, admin)).status, 403);
      assert.equal((await call('/users/user/lock', 'PATCH', { is_locked: true }, admin)).status, 200);
      assert.equal((await call('/auth/me', 'GET', undefined, user)).status, 403);
      assert.equal((await call('/auth/login', 'POST', { email: 'user@test.vn', password: 'password' })).status, 403);
      await call('/users/user/lock', 'PATCH', { is_locked: false }, admin);
      assert.equal((await call('/auth/me', 'GET', undefined, user)).status, 200);
    });
    await t.test('reset seed requires admin and local DB, restores 16 rows without removing custom data', async () => {
      const previous = { DATABASE_URL: process.env.DATABASE_URL, DIRECT_URL: process.env.DIRECT_URL, NODE_ENV: process.env.NODE_ENV };
      let upserts = 0;
      patch(prisma.place, 'upsert', async ({ where, update, create }: any) => {
        upserts++;
        const existing = places.find(p => p.id === where.id);
        if (existing) { Object.assign(existing, update); return existing; }
        const place = { ...create }; places.push(place); return place;
      });
      patch(prisma, '$transaction', async (operations: Promise<unknown>[]) => Promise.all(operations));
      try {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL = 'postgresql://localhost/vivu_test';
        process.env.DIRECT_URL = 'postgresql://localhost/vivu_test';
        assert.equal((await call('/places/reset-seed', 'POST')).status, 401);
        assert.equal((await call('/places/reset-seed', 'POST', undefined, user)).status, 403);
        process.env.DATABASE_URL = 'postgresql://remote.invalid/vivu';
        assert.equal((await call('/places/reset-seed', 'POST', undefined, admin)).status, 403);
        process.env.DATABASE_URL = 'postgresql://localhost/vivu_test';
        process.env.DIRECT_URL = 'postgresql://remote.invalid/vivu';
        assert.equal((await call('/places/reset-seed', 'POST', undefined, admin)).status, 403);
        process.env.DIRECT_URL = 'postgresql://localhost/vivu_test';
        process.env.NODE_ENV = 'production';
        assert.equal((await call('/places/reset-seed', 'POST', undefined, admin)).status, 403);
        assert.equal(upserts, 0);
        process.env.NODE_ENV = 'test';
        places.push({ id: 'dn01', name: 'Changed demo', is_active: false, rating: 3.2, review_count: 8 });
        const customBefore = JSON.stringify(places.find(p => p.id === 'created'));
        const usersBefore = JSON.stringify(users);
        const reset = await call('/places/reset-seed', 'POST', undefined, admin);
        assert.equal(reset.status, 200);
        assert.equal(reset.body.data.restored_count, 16);
        assert.equal(places.find(p => p.id === 'dn01').is_active, true);
        assert.notEqual(places.find(p => p.id === 'dn01').name, 'Changed demo');
        assert.equal(places.find(p => p.id === 'dn01').rating, 3.2);
        assert.equal(places.find(p => p.id === 'dn01').review_count, 8);
        assert.equal(JSON.stringify(places.find(p => p.id === 'created')), customBefore);
        assert.equal(JSON.stringify(users), usersBefore);
        const count = places.length;
        assert.equal((await call('/places/reset-seed', 'POST', undefined, admin)).status, 200);
        assert.equal(places.length, count);
      } finally {
        for (const [key, value] of Object.entries(previous)) {
          if (value === undefined) delete process.env[key]; else process.env[key] = value;
        }
      }
    });
    await t.test('CORS allows configured web origin and rejects unlisted origin', async () => {
      const allowed = await fetch(`http://127.0.0.1:${address.port}/api/health`, { headers: { Origin: 'http://localhost:8081' } });
      assert.equal(allowed.status, 200);
      assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:8081');
      const denied = await fetch(`http://127.0.0.1:${address.port}/api/health`, { headers: { Origin: 'https://unlisted.invalid' } });
      assert.equal(denied.status, 403);
      assert.equal((await denied.json()).success, false);
    });
    await t.test('JSON errors, unknown routes and server failures use standard envelopes', async () => {
      const malformed = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
      assert.equal(malformed.status, 400); assert.equal((await malformed.json()).success, false);
      assert.equal((await call('/missing')).status, 404);
      patch(prisma.place, 'findMany', async () => { throw new Error('private database detail'); });
      const failure = await call('/places');
      assert.equal(failure.status, 500); assert.equal(failure.body.success, false);
      assert.ok(!failure.body.message.includes('private'));
    });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

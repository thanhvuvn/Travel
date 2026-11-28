import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncRoute, HttpError } from '../lib/http';
import { requireAuth, requireAdmin } from '../middleware/auth';

import { SEED_PLACES } from '../data/seedPlaces';

const router = Router();
const categories = ['food', 'beach', 'checkin', 'culture', 'cafe'];
export function validatePlace(body: unknown, partial = false): Prisma.PlaceCreateInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Dữ liệu địa điểm không hợp lệ.');
  const input = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const fail = (key: string): never => { throw new HttpError(400, `Trường ${key} không hợp lệ.`); };
  for (const key of ['name', 'type', 'description', 'image', 'open_hours', 'best_time']) {
    if (input[key] === undefined) continue;
    if (key === 'best_time' && input[key] === null) { data[key] = null; continue; }
    if (typeof input[key] !== 'string' || (input[key] as string).length > 10000) fail(key);
    data[key] = (input[key] as string).trim();
    if (['name', 'type', 'description', 'open_hours'].includes(key) && !data[key]) fail(key);
  }
  if (data.image && !/^https?:\/\//i.test(data.image as string)) fail('image');
  for (const [key, allowed] of Object.entries({ area: ['danang', 'hoian'], category: categories,
    weather_suitability: ['all', 'sunny', 'rainy', 'indoor'] })) {
    if (input[key] !== undefined) { if (!allowed.includes(input[key] as string)) fail(key); data[key] = input[key]; }
  }
  for (const [key, min, max] of [['lat', -90, 90], ['lng', -180, 180], ['avg_cost', 0, 2147483647]] as const) {
    if (input[key] === undefined) continue;
    const n = input[key];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max || (key === 'avg_cost' && !Number.isInteger(n))) fail(key);
    data[key] = n;
  }
  for (const key of ['tags', 'events', 'seasons']) {
    const value = input[key];
    if (value === undefined) continue;
    if (!Array.isArray(value) || value.length > 100 || value.some(v => typeof v !== 'string' || v.length > 100)) fail(key);
    if (key === 'seasons' && (value as string[]).some(v => !['all', 'spring', 'summer', 'autumn', 'winter'].includes(v))) fail(key);
    data[key] = value;
  }
  if (input.is_active !== undefined) {
    if (typeof input.is_active !== 'boolean') fail('is_active');
    data.is_active = input.is_active;
  }
  if (!partial) for (const key of ['name', 'type', 'description', 'image', 'area', 'category', 'lat', 'lng']) {
    if (data[key] === undefined) fail(key);
  }
  if (!Object.keys(data).length) throw new HttpError(400, 'Không có trường hợp lệ để cập nhật.');
  return data as unknown as Prisma.PlaceCreateInput;
}
// Chỉ yêu cầu JWT khi người gọi muốn đọc cả địa điểm ẩn.
router.use((req, res, next) => {
  if (req.method !== 'GET' || req.query.include_inactive === undefined) return next();
  if (!['true', 'false'].includes(String(req.query.include_inactive))) return next(new HttpError(400, 'include_inactive phải là true hoặc false.'));
  if (req.query.include_inactive !== 'true') return next();
  requireAuth(req, res, error => error ? next(error) : requireAdmin(req, res, next));
});
router.get('/', asyncRoute(async (req, res) => {
  const { area, category, q } = req.query;
  if (area !== undefined && !['danang', 'hoian'].includes(String(area))) throw new HttpError(400, 'Khu vực không hợp lệ.');
  if (category !== undefined && !categories.includes(String(category))) throw new HttpError(400, 'Danh mục không hợp lệ.');
  if (q !== undefined && (typeof q !== 'string' || q.length > 200)) throw new HttpError(400, 'Từ khóa không hợp lệ.');
  const where: Prisma.PlaceWhereInput = {
    ...(req.query.include_inactive === 'true' ? {} : { is_active: true }),
    ...(area ? { area: area as 'danang' | 'hoian' } : {}),
    ...(category ? { category: String(category) } : {}),
    ...(q ? { OR: [{ name: { contains: String(q), mode: 'insensitive' } }, { tags: { has: String(q) } }] } : {}),
  };
  res.json({ success: true, data: await prisma.place.findMany({ where, orderBy: { created_at: 'desc' } }) });
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const place = await prisma.place.findFirst({ where: { id: String(req.params.id),
    ...(req.query.include_inactive === 'true' ? {} : { is_active: true }) } });
  if (!place) throw new HttpError(404, 'Không tìm thấy địa điểm.');
  res.json({ success: true, data: place });
}));
router.use(requireAuth, requireAdmin);
router.post('/reset-seed', asyncRoute(async (_req, res) => {
  const localDatabase = (value: string | undefined) => {
    try { const url = new URL(value || ''); return ['postgres:', 'postgresql:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname); }
    catch { return false; }
  };
  if (process.env.NODE_ENV === 'production' || !localDatabase(process.env.DATABASE_URL) ||
    !localDatabase(process.env.DIRECT_URL || process.env.DATABASE_URL)) {
    throw new HttpError(403, 'Khôi phục mẫu chỉ được phép trên database local/test tại localhost.');
  }
  // Restore only the known demo rows in one transaction, never delete relations.
  // Keep rating/review_count on existing rows because community moderation owns them.
  const places = await prisma.$transaction(SEED_PLACES.map(place => {
    const { id, rating, review_count, ...metadata } = place;
    return prisma.place.upsert({ where: { id }, update: metadata, create: place });
  }));
  res.json({ success: true, data: { restored_count: places.length, places } });
}));
router.post('/', asyncRoute(async (req, res) => {
  const place = await prisma.place.create({ data: validatePlace(req.body) });
  res.status(201).json({ success: true, data: place });
}));
router.put('/:id', asyncRoute(async (req, res) => {
  res.json({ success: true, data: await prisma.place.update({ where: { id: String(req.params.id) }, data: validatePlace(req.body, true) }) });
}));
router.delete('/:id', asyncRoute(async (req, res) => {
  res.json({ success: true, data: await prisma.place.update({ where: { id: String(req.params.id) }, data: { is_active: false } }) });
}));
router.patch('/:id/toggle', asyncRoute(async (req, res) => {
  const id = String(req.params.id);
  if (req.body?.is_active !== undefined) {
    if (typeof req.body.is_active !== 'boolean') throw new HttpError(400, 'is_active phải là boolean.');
    res.json({ success: true, data: await prisma.place.update({ where: { id }, data: { is_active: req.body.is_active } }) });
    return;
  }
  // Atomic toggle, kể cả khi nhiều admin thao tác đồng thời.
  const place = await prisma.$transaction(async tx => {
    const rows = await tx.$executeRaw`UPDATE places SET is_active = NOT is_active, updated_at = NOW() WHERE id = ${id}`;
    if (!rows) throw new HttpError(404, 'Không tìm thấy địa điểm.');
    return tx.place.findUnique({ where: { id } });
  });
  res.json({ success: true, data: place });
}));
export default router;

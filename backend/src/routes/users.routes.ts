import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { publicUserSelect } from '../lib/auth';
import { asyncRoute, HttpError } from '../lib/http';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/', asyncRoute(async (_req, res) => {
  res.json({ success: true, data: await prisma.user.findMany({ select: publicUserSelect, orderBy: { created_at: 'desc' } }) });
}));
router.patch('/:id/lock', asyncRoute(async (req, res) => {
  if (typeof req.body?.is_locked !== 'boolean') throw new HttpError(400, 'is_locked phải là boolean.');
  const id = String(req.params.id);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, 'Không tìm thấy tài khoản.');
  // Không cho khóa admin, tránh mất quyền quản trị cuối cùng và tự khóa.
  if (target.role === 'admin') throw new HttpError(403, 'Không thể khóa tài khoản quản trị viên.');
  const user = await prisma.user.update({ where: { id }, data: { is_locked: req.body.is_locked }, select: publicUserSelect });
  res.json({ success: true, data: user });
}));
export default router;

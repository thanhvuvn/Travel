import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { publicUserSelect, signToken } from '../lib/auth';
import { asyncRoute, HttpError } from '../lib/http';
import { requireAuth } from '../middleware/auth';

const router = Router();
function credentials(body: any) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body?.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Email không hợp lệ.');
  if (typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password) > 72)
    throw new HttpError(400, 'Mật khẩu cần ít nhất 6 ký tự và tối đa 72 bytes.');
  return { email, password };
}
router.post('/register', asyncRoute(async (req, res) => {
  const { email, password } = credentials(req.body);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Họ tên cần từ 2 đến 100 ký tự.');
  if (await prisma.user.findUnique({ where: { email } })) throw new HttpError(409, 'Email đã được sử dụng.');
  const user = await prisma.user.create({
    data: { name, email, password_hash: await bcrypt.hash(password, 12) }, select: publicUserSelect,
  });
  res.status(201).json({ success: true, data: { user, token: signToken(user.id) } });
}));
router.post('/login', asyncRoute(async (req, res) => {
  const { email, password } = credentials(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password_hash)) throw new HttpError(401, 'Email hoặc mật khẩu không đúng.');
  if (user.is_locked) throw new HttpError(403, 'Tài khoản đã bị khóa.');
  const { password_hash: _password, ...profile } = user;
  res.json({ success: true, data: { user: profile, token: signToken(user.id) } });
}));
router.get('/me', requireAuth, (_req, res) => { res.json({ success: true, data: res.locals.user }); });
export default router;

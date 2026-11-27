import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { jwtSecret, publicUserSelect } from '../lib/auth';
import { asyncRoute, HttpError } from '../lib/http';

export const requireAuth = asyncRoute(async (req, res, next) => {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!match) throw new HttpError(401, 'Vui lòng đăng nhập.');
  let id: string;
  const secret = jwtSecret();
  try {
    const payload = jwt.verify(match[1], secret, {
      algorithms: ['HS256'], issuer: 'vivu-api', audience: 'vivu-client',
    });
    if (typeof payload === 'string' || !payload.sub) throw new Error();
    id = payload.sub;
  } catch { throw new HttpError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'); }
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) throw new HttpError(401, 'Tài khoản không tồn tại.');
  if (user.is_locked) throw new HttpError(403, 'Tài khoản đã bị khóa.');
  res.locals.user = user;
  next();
});
export const requireAdmin: RequestHandler = (_req, res, next) => {
  if (!res.locals.user) return next(new HttpError(401, 'Vui lòng đăng nhập.'));
  if (res.locals.user.role !== 'admin') return next(new HttpError(403, 'Chỉ quản trị viên được phép.'));
  next();
};

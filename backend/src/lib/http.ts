import { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const asyncRoute = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let status = 500;
  let message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
  if (error instanceof HttpError) { status = error.status; message = error.message; }
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') { status = 409; message = 'Dữ liệu đã tồn tại.'; }
    if (error.code === 'P2025') { status = 404; message = 'Không tìm thấy dữ liệu.'; }
  } else if (error?.type === 'entity.parse.failed') { status = 400; message = 'JSON không hợp lệ.'; }
  else if (error?.type === 'entity.too.large') { status = 413; message = 'Dữ liệu quá lớn.'; }
  res.status(status).json({ success: false, message });
};

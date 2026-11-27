import jwt from 'jsonwebtoken';

export const publicUserSelect = {
  id: true, name: true, email: true, role: true, is_locked: true, created_at: true,
} as const;

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET cần ít nhất 32 bytes.');
  return secret;
}
export const signToken = (id: string) => jwt.sign({}, jwtSecret(), {
  subject: id, algorithm: 'HS256', expiresIn: '1d', issuer: 'vivu-api', audience: 'vivu-client',
});

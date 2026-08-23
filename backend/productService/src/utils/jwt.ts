import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
}

/**
 * Verifies a JWT against the application secret.
 * Throws JsonWebTokenError or TokenExpiredError if invalid.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwt.secret);
  if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return decoded as TokenPayload;
}

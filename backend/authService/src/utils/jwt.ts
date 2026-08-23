import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
}

/**
 * Generates a signed JWT for an authenticated user
 * Payload is kept minimal with only userId
 */
export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign(payload, env.jwt.secret, options);
}

/**
 * Verifies a JWT against the application secret
 * Throws JsonWebTokenError or TokenExpiredError if invalid
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwt.secret);
  if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return decoded as TokenPayload;
}

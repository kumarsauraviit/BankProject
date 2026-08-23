import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

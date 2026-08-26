import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
    };
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }
}

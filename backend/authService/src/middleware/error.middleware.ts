import type { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err.code === '23505') {
    res.status(409).json({ success: false, error: 'Email already exists' });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

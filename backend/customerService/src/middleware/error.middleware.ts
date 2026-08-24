import type { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

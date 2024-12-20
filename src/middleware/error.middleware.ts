import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
}

export function errorHandler(err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}
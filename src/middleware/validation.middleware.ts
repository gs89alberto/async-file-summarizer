import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../common/errors';

export function validationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }

  return next();
}

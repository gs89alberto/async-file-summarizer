import { body, param, query } from 'express-validator';
import { validationMiddleware } from '../middleware/validation.middleware';
import { JobStatus } from '../types/JobTypes';

export const uploadFileValidator = [
  body('file')
    .custom((_value, { req }) => {
      return !!req.file;
    })
    .withMessage('No file uploaded'),
  validationMiddleware,
];

export const getJobByIdValidator = [
  param('jobId')
    .exists()
    .withMessage('jobId is required as a route param')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('jobId must be a positive integer')
    .toInt(),
  validationMiddleware,
];

export const getJobListValidator = [
  query('status')
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage(`status must be one of the following values: ${Object.values(JobStatus).join(', ')}`),

  query('page').optional().isInt({ gt: 0 }).withMessage('page must be a positive integer').toInt(),

  query('pageSize').optional().isInt({ gt: 0 }).withMessage('pageSize must be a positive integer').toInt(),

  validationMiddleware,
];

import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

/**
 * Middleware to validate request based on express-validator rules
 * Use after validation rules in route definition
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    throw ApiError.badRequest('Validation failed', extractedErrors);
  }

  next();
};

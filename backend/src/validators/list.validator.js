import { body, param } from 'express-validator';

/**
 * Validation rules for creating a list
 */
export const createListValidation = [
  param('boardId')
    .isMongoId()
    .withMessage('Invalid board ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('List title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
];

/**
 * Validation rules for updating a list
 */
export const updateListValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('List title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
];

/**
 * Validation rules for list ID parameter
 */
export const listIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),
];

/**
 * Validation rules for updating list position
 */
export const updateListPositionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),

  body('position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

import { body, param } from 'express-validator';

/**
 * Validation rules for creating a board
 */
export const createBoardValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Board title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid color format. Use hex color (e.g., #0284c7)'),
];

/**
 * Validation rules for updating a board
 */
export const updateBoardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid board ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid color format'),
];

/**
 * Validation rules for board ID parameter
 */
export const boardIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid board ID'),
];

/**
 * Validation rules for adding a member
 */
export const addMemberValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid board ID'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

/**
 * Validation rules for removing a member
 */
export const removeMemberValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid board ID'),

  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

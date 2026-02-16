import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a task
 */
export const createTaskValidation = [
  param('listId')
    .isMongoId()
    .withMessage('Invalid list ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use ISO 8601 format'),

  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),

  body('labels.*.color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid label color format'),

  body('labels.*.text')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Label text cannot exceed 30 characters'),
];

/**
 * Validation rules for updating a task
 */
export const updateTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to clear due date
      return new Date(value).toString() !== 'Invalid Date';
    })
    .withMessage('Invalid date format'),

  body('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean'),

  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
];

/**
 * Validation rules for task ID parameter
 */
export const taskIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
];

/**
 * Validation rules for moving a task
 */
export const moveTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),

  body('newListId')
    .isMongoId()
    .withMessage('Invalid list ID'),

  body('newPosition')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

/**
 * Validation rules for assigning a user to task
 */
export const assignTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),

  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

/**
 * Validation rules for unassigning a user from task
 */
export const unassignTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),

  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

/**
 * Validation rules for searching tasks
 */
export const searchTasksValidation = [
  param('boardId')
    .isMongoId()
    .withMessage('Invalid board ID'),

  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignedTo filter'),

  query('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean'),
];

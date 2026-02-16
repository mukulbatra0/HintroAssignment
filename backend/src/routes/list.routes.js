import express from 'express';
import {
  createList,
  updateList,
  deleteList,
  updateListPosition,
  getBoardLists,
} from '../controllers/list.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createListValidation,
  updateListValidation,
  listIdValidation,
  updateListPositionValidation,
} from '../validators/list.validator.js';

const router = express.Router();

// All list routes require authentication
router.use(protect);

// List operations
router.post('/boards/:boardId/lists', createListValidation, validate, createList);
router.get('/boards/:boardId/lists', getBoardLists);
router.put('/lists/:id', updateListValidation, validate, updateList);
router.delete('/lists/:id', listIdValidation, validate, deleteList);
router.put('/lists/:id/position', updateListPositionValidation, validate, updateListPosition);

export default router;

import express from 'express';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} from '../controllers/board.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBoardValidation,
  updateBoardValidation,
  boardIdValidation,
  addMemberValidation,
  removeMemberValidation,
} from '../validators/board.validator.js';

const router = express.Router();

// All board routes require authentication
router.use(protect);

// Board CRUD
router.get('/', getBoards);
router.post('/', createBoardValidation, validate, createBoard);
router.get('/:id', boardIdValidation, validate, getBoard);
router.put('/:id', updateBoardValidation, validate, updateBoard);
router.delete('/:id', boardIdValidation, validate, deleteBoard);

// Member management
router.post('/:id/members', addMemberValidation, validate, addMember);
router.delete('/:id/members/:userId', removeMemberValidation, validate, removeMember);

export default router;

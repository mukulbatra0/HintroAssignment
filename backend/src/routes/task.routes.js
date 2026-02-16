import express from 'express';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  assignUser,
  unassignUser,
  searchTasks,
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  moveTaskValidation,
  assignTaskValidation,
  unassignTaskValidation,
  searchTasksValidation,
} from '../validators/task.validator.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Task CRUD
router.post('/lists/:listId/tasks', createTaskValidation, validate, createTask);
router.get('/tasks/:id', taskIdValidation, validate, getTask);
router.put('/tasks/:id', updateTaskValidation, validate, updateTask);
router.delete('/tasks/:id', taskIdValidation, validate, deleteTask);

// Task movement (drag and drop)
router.put('/tasks/:id/move', moveTaskValidation, validate, moveTask);

// Task assignment
router.post('/tasks/:id/assign', assignTaskValidation, validate, assignUser);
router.delete('/tasks/:id/assign/:userId', unassignTaskValidation, validate, unassignUser);

// Task search
router.get('/boards/:boardId/tasks/search', searchTasksValidation, validate, searchTasks);

export default router;

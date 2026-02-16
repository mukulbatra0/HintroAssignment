import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';
import taskService from '../services/task.service.js';
import { getPaginationParams } from '../utils/pagination.js';

/**
 * @desc    Create a new task in a list
 * @route   POST /api/lists/:listId/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, labels } = req.body;

  const task = await taskService.createTask(req.params.listId, req.user._id, {
    title,
    description,
    dueDate,
    labels,
  });

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(task, 'Task created successfully')
  );
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(task, 'Task retrieved successfully')
  );
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, labels, isCompleted } = req.body;

  const task = await taskService.updateTask(req.params.id, req.user._id, {
    title,
    description,
    dueDate,
    labels,
    isCompleted,
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(task, 'Task updated successfully')
  );
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, result.message)
  );
});

/**
 * @desc    Move task to different list/position
 * @route   PUT /api/tasks/:id/move
 * @access  Private
 */
export const moveTask = asyncHandler(async (req, res) => {
  const { newListId, newPosition } = req.body;

  const task = await taskService.moveTask(
    req.params.id,
    req.user._id,
    newListId,
    newPosition
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(task, 'Task moved successfully')
  );
});

/**
 * @desc    Assign user to task
 * @route   POST /api/tasks/:id/assign
 * @access  Private
 */
export const assignUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const task = await taskService.assignUser(
    req.params.id,
    req.user._id,
    userId
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(task, 'User assigned successfully')
  );
});

/**
 * @desc    Unassign user from task
 * @route   DELETE /api/tasks/:id/assign/:userId
 * @access  Private
 */
export const unassignUser = asyncHandler(async (req, res) => {
  const task = await taskService.unassignUser(
    req.params.id,
    req.user._id,
    req.params.userId
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(task, 'User unassigned successfully')
  );
});

/**
 * @desc    Search tasks with filters and pagination
 * @route   GET /api/boards/:boardId/tasks/search
 * @access  Private
 */
export const searchTasks = asyncHandler(async (req, res) => {
  const { q, assignedTo, isCompleted, dueBefore } = req.query;
  
  const paginationParams = getPaginationParams(req);

  const result = await taskService.searchTasks(
    req.params.boardId,
    req.user._id,
    { q, assignedTo, isCompleted, dueBefore },
    paginationParams
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Tasks retrieved successfully')
  );
});

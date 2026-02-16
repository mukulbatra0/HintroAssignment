import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';
import listService from '../services/list.service.js';

/**
 * @desc    Create a new list in a board
 * @route   POST /api/boards/:boardId/lists
 * @access  Private
 */
export const createList = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const list = await listService.createList(req.params.boardId, req.user._id, {
    title,
  });

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(list, 'List created successfully')
  );
});

/**
 * @desc    Update list title
 * @route   PUT /api/lists/:id
 * @access  Private
 */
export const updateList = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const list = await listService.updateList(req.params.id, req.user._id, {
    title,
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(list, 'List updated successfully')
  );
});

/**
 * @desc    Delete list
 * @route   DELETE /api/lists/:id
 * @access  Private
 */
export const deleteList = asyncHandler(async (req, res) => {
  const result = await listService.deleteList(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, result.message)
  );
});

/**
 * @desc    Update list position
 * @route   PUT /api/lists/:id/position
 * @access  Private
 */
export const updateListPosition = asyncHandler(async (req, res) => {
  const { position } = req.body;

  const list = await listService.updateListPosition(
    req.params.id,
    req.user._id,
    position
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(list, 'List position updated successfully')
  );
});

/**
 * @desc    Get all lists for a board
 * @route   GET /api/boards/:boardId/lists
 * @access  Private
 */
export const getBoardLists = asyncHandler(async (req, res) => {
  const lists = await listService.getBoardLists(
    req.params.boardId,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(lists, 'Lists retrieved successfully')
  );
});

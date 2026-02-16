import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';
import boardService from '../services/board.service.js';

/**
 * @desc    Get all boards for authenticated user
 * @route   GET /api/boards
 * @access  Private
 */
export const getBoards = asyncHandler(async (req, res) => {
  const boards = await boardService.getUserBoards(req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(boards, 'Boards retrieved successfully')
  );
});

/**
 * @desc    Get single board by ID with lists and tasks
 * @route   GET /api/boards/:id
 * @access  Private
 */
export const getBoard = asyncHandler(async (req, res) => {
  const { board, lists } = await boardService.getBoardById(
    req.params.id,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({ board, lists }, 'Board retrieved successfully')
  );
});

/**
 * @desc    Create a new board
 * @route   POST /api/boards
 * @access  Private
 */
export const createBoard = asyncHandler(async (req, res) => {
  const { title, description, backgroundColor } = req.body;

  const board = await boardService.createBoard(req.user._id, {
    title,
    description,
    backgroundColor,
  });

  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(board, 'Board created successfully')
  );
});

/**
 * @desc    Update board
 * @route   PUT /api/boards/:id
 * @access  Private (Owner only)
 */
export const updateBoard = asyncHandler(async (req, res) => {
  const { title, description, backgroundColor } = req.body;

  const board = await boardService.updateBoard(req.params.id, req.user._id, {
    title,
    description,
    backgroundColor,
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(board, 'Board updated successfully')
  );
});

/**
 * @desc    Delete board (archive)
 * @route   DELETE /api/boards/:id
 * @access  Private (Owner only)
 */
export const deleteBoard = asyncHandler(async (req, res) => {
  await boardService.deleteBoard(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, 'Board deleted successfully')
  );
});

/**
 * @desc    Add member to board
 * @route   POST /api/boards/:id/members
 * @access  Private
 */
export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const board = await boardService.addMember(
    req.params.id,
    req.user._id,
    email
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(board, 'Member added successfully')
  );
});

/**
 * @desc    Remove member from board
 * @route   DELETE /api/boards/:id/members/:userId
 * @access  Private (Owner only)
 */
export const removeMember = asyncHandler(async (req, res) => {
  const board = await boardService.removeMember(
    req.params.id,
    req.user._id,
    req.params.userId
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(board, 'Member removed successfully')
  );
});

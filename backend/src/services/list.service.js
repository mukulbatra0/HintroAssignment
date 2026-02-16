import { List, Board, Task, Activity } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

/**
 * List Service
 * Contains business logic for list operations
 */
class ListService {
  /**
   * Create a new list in a board
   */
  async createList(boardId, userId, listData) {
    const { title } = listData;

    // Check if board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Create list (position will be auto-incremented in model)
    const list = await List.create({
      title,
      board: boardId,
    });

    // Log activity
    await Activity.createActivity(
      boardId,
      userId,
      ACTIVITY_TYPES.LIST_CREATED,
      'list',
      list._id,
      { listTitle: title }
    );

    return list;
  }

  /**
   * Update list title
   */
  async updateList(listId, userId, updateData) {
    const { title } = updateData;

    const list = await List.findById(listId).populate('board');

    if (!list) {
      throw ApiError.notFound('List not found');
    }

    // Check if user has access to the board
    if (!list.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    list.title = title;
    await list.save();

    // Log activity
    await Activity.createActivity(
      list.board._id,
      userId,
      ACTIVITY_TYPES.LIST_UPDATED,
      'list',
      list._id,
      { listTitle: title }
    );

    return list;
  }

  /**
   * Delete list and its tasks
   */
  async deleteList(listId, userId) {
    const list = await List.findById(listId).populate('board');

    if (!list) {
      throw ApiError.notFound('List not found');
    }

    // Check if user has access to the board
    if (!list.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    const listTitle = list.title;
    const listPosition = list.position;
    const boardId = list.board._id;

    // Delete all tasks in this list
    await Task.deleteMany({ list: listId });

    // Delete the list
    await list.deleteOne();

    // Reorder remaining lists
    await List.reorderAfterDelete(boardId, listPosition);

    // Log activity
    await Activity.createActivity(
      boardId,
      userId,
      ACTIVITY_TYPES.LIST_DELETED,
      'list',
      listId,
      { listTitle }
    );

    return { message: 'List deleted successfully' };
  }

  /**
   * Update list position (for drag-and-drop)
   */
  async updateListPosition(listId, userId, newPosition) {
    const list = await List.findById(listId).populate('board');

    if (!list) {
      throw ApiError.notFound('List not found');
    }

    // Check if user has access to the board
    if (!list.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    const oldPosition = list.position;
    const boardId = list.board._id;

    // If moving to a different position
    if (oldPosition !== newPosition) {
      if (newPosition > oldPosition) {
        // Moving down - shift lists up
        await List.updateMany(
          {
            board: boardId,
            position: { $gt: oldPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } }
        );
      } else {
        // Moving up - shift lists down
        await List.updateMany(
          {
            board: boardId,
            position: { $gte: newPosition, $lt: oldPosition },
          },
          { $inc: { position: 1 } }
        );
      }

      list.position = newPosition;
      await list.save();
    }

    return list;
  }

  async getBoardLists(boardId, userId) {
    // Check if board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    const lists = await List.find({ board: boardId })
      .sort({ position: 1 })
      .populate({
        path: 'tasks',
        options: { sort: { position: 1 } },
        populate: { path: 'assignedTo', select: 'name email avatar' },
      });

    return lists;
  }
}

export default new ListService();

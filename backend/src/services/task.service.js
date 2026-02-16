import { Task, List, Board, Activity, User } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ACTIVITY_TYPES } from '../config/constants.js';
import { getPaginationParams, paginatedResponse } from '../utils/pagination.js';

/**
 * Task Service
 * Contains business logic for task operations
 */
class TaskService {
  /**
   * Create a new task in a list
   */
  async createTask(listId, userId, taskData) {
    const { title, description, dueDate, labels } = taskData;

    // Check if list exists and get board info
    const list = await List.findById(listId).populate('board');

    if (!list) {
      throw ApiError.notFound('List not found');
    }

    // Check if user has access to the board
    if (!list.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Create task (position will be auto-incremented in model)
    const task = await Task.create({
      title,
      description,
      list: listId,
      board: list.board._id,
      dueDate,
      labels: labels || [],
    });

    await task.populate('assignedTo', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      list.board._id,
      userId,
      ACTIVITY_TYPES.TASK_CREATED,
      'task',
      task._id,
      { taskTitle: title, listTitle: list.title }
    );

    return task;
  }

  /**
   * Get single task by ID
   */
  async getTaskById(taskId, userId) {
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('list', 'title')
      .populate('board', 'title');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId, userId, updateData) {
    const task = await Task.findById(taskId).populate('board list');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    if (!task.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    const { title, description, dueDate, labels, isCompleted } = updateData;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels !== undefined) task.labels = labels;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;

    await task.save();
    await task.populate('assignedTo', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      task.board._id,
      userId,
      ACTIVITY_TYPES.TASK_UPDATED,
      'task',
      task._id,
      { taskTitle: task.title }
    );

    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, userId) {
    const task = await Task.findById(taskId).populate('board');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    if (!task.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    const taskTitle = task.title;
    const listId = task.list;
    const position = task.position;
    const boardId = task.board._id;

    // Delete the task
    await task.deleteOne();

    // Reorder remaining tasks in the list
    await Task.reorderAfterDelete(listId, position);

    // Log activity
    await Activity.createActivity(
      boardId,
      userId,
      ACTIVITY_TYPES.TASK_DELETED,
      'task',
      taskId,
      { taskTitle }
    );

    return { message: 'Task deleted successfully' };
  }

  /**
   * Move task to different list/position
   */
  async moveTask(taskId, userId, newListId, newPosition) {
    const task = await Task.findById(taskId).populate('board');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    if (!task.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Verify new list exists and belongs to same board
    const newList = await List.findById(newListId);
    if (!newList) {
      throw ApiError.notFound('Target list not found');
    }

    if (newList.board.toString() !== task.board._id.toString()) {
      throw ApiError.badRequest('Cannot move task to a list in a different board');
    }

    const oldList = await List.findById(task.list);

    // Use the model's static method to handle the move
    const movedTask = await Task.moveTask(taskId, newListId, newPosition);

    await movedTask.populate('assignedTo', 'name email avatar');

    // Log activity if moved to different list
    if (oldList._id.toString() !== newListId.toString()) {
      await Activity.createActivity(
        task.board._id,
        userId,
        ACTIVITY_TYPES.TASK_MOVED,
        'task',
        task._id,
        {
          taskTitle: task.title,
          fromList: oldList.title,
          toList: newList.title,
        }
      );
    }

    return movedTask;
  }

  /**
   * Assign user to task
   */
  async assignUser(taskId, userId, userIdToAssign) {
    const task = await Task.findById(taskId).populate('board');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    if (!task.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Check if user to assign exists and is a board member
    const userToAssign = await User.findById(userIdToAssign);
    if (!userToAssign) {
      throw ApiError.notFound('User not found');
    }

    if (!task.board.hasAccess(userIdToAssign)) {
      throw ApiError.badRequest('User is not a member of this board');
    }

    // Check if already assigned
    if (task.assignedTo.includes(userIdToAssign)) {
      throw ApiError.conflict('User is already assigned to this task');
    }

    // Assign user
    task.assignedTo.push(userIdToAssign);
    await task.save();
    await task.populate('assignedTo', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      task.board._id,
      userId,
      ACTIVITY_TYPES.TASK_ASSIGNED,
      'task',
      task._id,
      {
        taskTitle: task.title,
        assigneeName: userToAssign.name,
      }
    );

    return task;
  }

  /**
   * Unassign user from task
   */
  async unassignUser(taskId, userId, userIdToUnassign) {
    const task = await Task.findById(taskId).populate('board');

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Check if user has access to the board
    if (!task.board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Check if user is assigned
    if (!task.assignedTo.includes(userIdToUnassign)) {
      throw ApiError.notFound('User is not assigned to this task');
    }

    const userToUnassign = await User.findById(userIdToUnassign);

    // Unassign user
    task.assignedTo = task.assignedTo.filter(
      (id) => id.toString() !== userIdToUnassign
    );
    await task.save();
    await task.populate('assignedTo', 'name email avatar');

    // Log activity
    if (userToUnassign) {
      await Activity.createActivity(
        task.board._id,
        userId,
        ACTIVITY_TYPES.TASK_UNASSIGNED,
        'task',
        task._id,
        {
          taskTitle: task.title,
          assigneeName: userToUnassign.name,
        }
      );
    }

    return task;
  }

  /**
   * Search tasks with filters and pagination
   */
  async searchTasks(boardId, userId, filters, paginationParams) {
    // Check if board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Build query
    const query = { board: boardId };

    // Text search
    if (filters.q) {
      query.$text = { $search: filters.q };
    }

    // Filter by assigned user
    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    // Filter by completion status
    if (filters.isCompleted !== undefined) {
      query.isCompleted = filters.isCompleted;
    }

    // Filter by due date
    if (filters.dueBefore) {
      query.dueDate = { $lte: new Date(filters.dueBefore) };
    }

    const { page, limit, skip } = paginationParams;

    // Execute query with pagination
    const tasks = await Task.find(query)
      .sort(filters.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email avatar')
      .populate('list', 'title');

    // Get total count
    const total = await Task.countDocuments(query);

    return paginatedResponse(tasks, total, page, limit);
  }
}

export default new TaskService();

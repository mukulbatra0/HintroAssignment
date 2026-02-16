import { SOCKET_EVENTS } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

/**
 * Task Socket Events Handler
 * Handles real-time events for tasks
 */
export const handleTaskEvents = (io, socket) => {
  /**
   * Task created event
   */
  socket.on(SOCKET_EVENTS.TASK_CREATED, (data) => {
    const { task, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_CREATED, { task });
    
    logger.info(`Task created: ${task.title} in board ${boardId}`);
  });

  /**
   * Task updated event
   */
  socket.on(SOCKET_EVENTS.TASK_UPDATED, (data) => {
    const { task, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_UPDATED, { task });
    
    logger.info(`Task updated: ${task.title}`);
  });

  /**
   * Task deleted event
   */
  socket.on(SOCKET_EVENTS.TASK_DELETED, (data) => {
    const { taskId, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_DELETED, { taskId });
    
    logger.info(`Task deleted: ${taskId}`);
  });

  /**
   * Task moved event (drag and drop)
   */
  socket.on(SOCKET_EVENTS.TASK_MOVED, (data) => {
    const { task, oldListId, newListId, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_MOVED, {
      task,
      oldListId,
      newListId,
    });
    
    logger.info(`Task ${task._id} moved from list ${oldListId} to ${newListId}`);
  });

  /**
   * User assigned to task event
   */
  socket.on(SOCKET_EVENTS.TASK_ASSIGNED, (data) => {
    const { task, assignedUser, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_ASSIGNED, {
      task,
      assignedUser,
    });
    
    // Notify the assigned user
    io.to(`user:${assignedUser._id}`).emit(SOCKET_EVENTS.TASK_ASSIGNED, {
      task,
      assignedUser,
    });
    
    logger.info(`User ${assignedUser.email} assigned to task ${task.title}`);
  });

  /**
   * User unassigned from task event
   */
  socket.on(SOCKET_EVENTS.TASK_UNASSIGNED, (data) => {
    const { task, unassignedUserId, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.TASK_UNASSIGNED, {
      task,
      unassignedUserId,
    });
    
    // Notify the unassigned user
    io.to(`user:${unassignedUserId}`).emit(SOCKET_EVENTS.TASK_UNASSIGNED, {
      task,
      unassignedUserId,
    });
    
    logger.info(`User ${unassignedUserId} unassigned from task ${task.title}`);
  });
};

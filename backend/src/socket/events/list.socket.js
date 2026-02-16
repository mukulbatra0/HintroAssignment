import { SOCKET_EVENTS } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';

/**
 * List Socket Events Handler
 * Handles real-time events for lists
 */
export const handleListEvents = (io, socket) => {
  /**
   * List created event
   */
  socket.on(SOCKET_EVENTS.LIST_CREATED, (data) => {
    const { list, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.LIST_CREATED, { list });
    
    logger.info(`List created: ${list.title} in board ${boardId}`);
  });

  /**
   * List updated event
   */
  socket.on(SOCKET_EVENTS.LIST_UPDATED, (data) => {
    const { list, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.LIST_UPDATED, { list });
    
    logger.info(`List updated: ${list.title}`);
  });

  /**
   * List deleted event
   */
  socket.on(SOCKET_EVENTS.LIST_DELETED, (data) => {
    const { listId, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.LIST_DELETED, { listId });
    
    logger.info(`List deleted: ${listId}`);
  });

  /**
   * List position updated (reordered)
   */
  socket.on(SOCKET_EVENTS.LIST_REORDERED, (data) => {
    const { listId, newPosition, boardId } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.LIST_REORDERED, {
      listId,
      newPosition,
    });
    
    logger.info(`List ${listId} moved to position ${newPosition}`);
  });
};

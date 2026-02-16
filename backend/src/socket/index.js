import { socketAuth } from './middleware/auth.socket.js';
import { handleBoardEvents } from './events/board.socket.js';
import { handleListEvents } from './events/list.socket.js';
import { handleTaskEvents } from './events/task.socket.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize Socket.io with authentication and event handlers
 */
export const initializeSocket = (io) => {
  // Add authentication middleware
  io.use(socketAuth);

  // Handle connections
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (${socket.user.email})`);

    // Join user-specific room for notifications
    socket.join(`user:${socket.user._id}`);

    // Register event handlers
    handleBoardEvents(io, socket);
    handleListEvents(io, socket);
    handleTaskEvents(io, socket);

    // Handle typing indicators (optional feature)
    socket.on('typing:start', (data) => {
      const { boardId, taskId } = data;
      socket.to(`board:${boardId}`).emit('typing:start', {
        user: {
          _id: socket.user._id,
          name: socket.user.name,
        },
        taskId,
      });
    });

    socket.on('typing:stop', (data) => {
      const { boardId, taskId } = data;
      socket.to(`board:${boardId}`).emit('typing:stop', {
        user: {
          _id: socket.user._id,
          name: socket.user.name,
        },
        taskId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (${socket.user.email})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('Socket.io initialized successfully');
};

/**
 * Emit event to specific board room
 */
export const emitToBoardRoom = (io, boardId, event, data) => {
  io.to(`board:${boardId}`).emit(event, data);
};

/**
 * Emit event to specific user
 */
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

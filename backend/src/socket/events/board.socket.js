import { SOCKET_EVENTS } from '../../config/constants.js';
import { logger } from '../../utils/logger.js';
import { Board } from '../../models/index.js';

/**
 * Board Socket Events Handler
 * Handles real-time events for boards
 */
export const handleBoardEvents = (io, socket) => {
  /**
   * Join a board room
   */
  socket.on(SOCKET_EVENTS.BOARD_JOIN, async (boardId) => {
    try {
      // Verify user has access to board
      const board = await Board.findById(boardId);
      
      if (!board) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Board not found' });
        return;
      }

      if (!board.hasAccess(socket.user._id)) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Access denied' });
        return;
      }

      // Join the board room
      socket.join(`board:${boardId}`);
      
      logger.info(`User ${socket.user.email} joined board ${boardId}`);
      
      // Notify others in the room
      socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.USER_JOINED, {
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email,
          avatar: socket.user.avatar,
        },
        boardId,
      });

      // Confirm to the user
      socket.emit(SOCKET_EVENTS.BOARD_JOIN, { success: true, boardId });
    } catch (error) {
      logger.error('Error joining board:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join board' });
    }
  });

  /**
   * Leave a board room
   */
  socket.on(SOCKET_EVENTS.BOARD_LEAVE, (boardId) => {
    socket.leave(`board:${boardId}`);
    
    logger.info(`User ${socket.user.email} left board ${boardId}`);
    
    // Notify others
    socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.USER_LEFT, {
      user: {
        _id: socket.user._id,
        name: socket.user.name,
      },
      boardId,
    });
  });

  /**
   * Board created event
   */
  socket.on(SOCKET_EVENTS.BOARD_CREATED, (data) => {
    const { board } = data;
    
    // Notify all members
    board.members.forEach((memberId) => {
      io.to(`user:${memberId}`).emit(SOCKET_EVENTS.BOARD_CREATED, { board });
    });
    
    logger.info(`Board created: ${board.title}`);
  });

  /**
   * Board updated event
   */
  socket.on(SOCKET_EVENTS.BOARD_UPDATED, (data) => {
    const { board } = data;
    
    // Broadcast to all users in the board room
    socket.to(`board:${board._id}`).emit(SOCKET_EVENTS.BOARD_UPDATED, { board });
    
    logger.info(`Board updated: ${board.title}`);
  });

  /**
   * Board deleted event
   */
  socket.on(SOCKET_EVENTS.BOARD_DELETED, (data) => {
    const { boardId } = data;
    
    // Broadcast to all users in the board room
    io.to(`board:${boardId}`).emit(SOCKET_EVENTS.BOARD_DELETED, { boardId });
    
    logger.info(`Board deleted: ${boardId}`);
  });

  /**
   * Member added event
   */
  socket.on(SOCKET_EVENTS.MEMBER_ADDED, (data) => {
    const { board, member } = data;
    
    // Broadcast to board room
    socket.to(`board:${board._id}`).emit(SOCKET_EVENTS.MEMBER_ADDED, {
      board,
      member,
    });
    
    // Notify the new member
    io.to(`user:${member._id}`).emit(SOCKET_EVENTS.MEMBER_ADDED, {
      board,
      member,
    });
    
    logger.info(`Member ${member.email} added to board ${board.title}`);
  });

  /**
   * Member removed event
   */
  socket.on(SOCKET_EVENTS.MEMBER_REMOVED, (data) => {
    const { boardId, memberId } = data;
    
    // Broadcast to board room
    io.to(`board:${boardId}`).emit(SOCKET_EVENTS.MEMBER_REMOVED, {
      boardId,
      memberId,
    });
    
    // Notify the removed member
    io.to(`user:${memberId}`).emit(SOCKET_EVENTS.MEMBER_REMOVED, {
      boardId,
      memberId,
    });
    
    logger.info(`Member ${memberId} removed from board ${boardId}`);
  });
};

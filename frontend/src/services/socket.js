import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  /**
   * Initialize socket connection
   */
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Setup core event listeners
   */
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Join a board room
   */
  joinBoard(boardId) {
    if (!this.socket) return;
    this.socket.emit('board:join', boardId);
  }

  /**
   * Leave a board room
   */
  leaveBoard(boardId) {
    if (!this.socket) return;
    this.socket.emit('board:leave', boardId);
  }

  /**
   * Emit board events
   */
  emitBoardCreated(board) {
    if (!this.socket) return;
    this.socket.emit('board:created', { board });
  }

  emitBoardUpdated(board) {
    if (!this.socket) return;
    this.socket.emit('board:updated', { board });
  }

  emitBoardDeleted(boardId) {
    if (!this.socket) return;
    this.socket.emit('board:deleted', { boardId });
  }

  emitMemberAdded(board, member) {
    if (!this.socket) return;
    this.socket.emit('member:added', { board, member });
  }

  emitMemberRemoved(boardId, memberId) {
    if (!this.socket) return;
    this.socket.emit('member:removed', { boardId, memberId });
  }

  /**
   * Emit list events
   */
  emitListCreated(list, boardId) {
    if (!this.socket) return;
    this.socket.emit('list:created', { list, boardId });
  }

  emitListUpdated(list, boardId) {
    if (!this.socket) return;
    this.socket.emit('list:updated', { list, boardId });
  }

  emitListDeleted(listId, boardId) {
    if (!this.socket) return;
    this.socket.emit('list:deleted', { listId, boardId });
  }

  emitListReordered(listId, newPosition, boardId) {
    if (!this.socket) return;
    this.socket.emit('list:reordered', { listId, newPosition, boardId });
  }

  /**
   * Emit task events
   */
  emitTaskCreated(task, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:created', { task, boardId });
  }

  emitTaskUpdated(task, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:updated', { task, boardId });
  }

  emitTaskDeleted(taskId, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:deleted', { taskId, boardId });
  }

  emitTaskMoved(task, oldListId, newListId, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:moved', { task, oldListId, newListId, boardId });
  }

  emitTaskAssigned(task, assignedUser, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:assigned', { task, assignedUser, boardId });
  }

  emitTaskUnassigned(task, unassignedUserId, boardId) {
    if (!this.socket) return;
    this.socket.emit('task:unassigned', { task, unassignedUserId, boardId });
  }

  /**
   * Listen to events
   */
  on(eventName, callback) {
    if (!this.socket) return;
    this.socket.on(eventName, callback);
  }

  /**
   * Remove event listener
   */
  off(eventName, callback) {
    if (!this.socket) return;
    this.socket.off(eventName, callback);
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Export singleton instance
export default new SocketClient();
